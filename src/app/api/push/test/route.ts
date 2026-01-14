import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/push";
import { generateJansori } from "@/lib/groq";

// 테스트용 - 즉시 푸시 알림 전송
export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 사용자의 푸시 구독 조회
  const subscriptions = await db.pushSubscription.findMany({
    where: { userId: session.user.id },
  });

  if (subscriptions.length === 0) {
    return NextResponse.json(
      { error: "푸시 알림이 등록되어 있지 않습니다. 먼저 알림을 활성화해주세요." },
      { status: 400 }
    );
  }

  // 사용자의 첫 번째 목표 가져오기 (있으면)
  const goal = await db.goal.findFirst({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  // 잔소리 생성
  const message = goal
    ? await generateJansori(goal.title, goal.intensity as 1 | 2 | 3)
    : "테스트 알림이야! 잘 오고 있지?";

  const results = [];

  // 모든 구독 기기에 전송
  for (const subscription of subscriptions) {
    const result = await sendPushNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh,
          auth: subscription.auth,
        },
      },
      "🗣️ 테스트 잔소리",
      message
    );

    results.push({
      subscriptionId: subscription.id,
      success: result.success,
    });
  }

  return NextResponse.json({
    message: "테스트 알림 전송 완료",
    jansori: message,
    results,
  });
}
