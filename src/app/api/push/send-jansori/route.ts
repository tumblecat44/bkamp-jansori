import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJansori } from "@/lib/groq";
import { sendPushNotification } from "@/lib/push";

// Vercel Cron에서 호출됨
export async function GET() {
  const now = new Date();
  const currentHour = now.getHours();

  // 현재 시간에 잔소리 받아야 할 활성화된 목표들 조회
  const goals = await db.goal.findMany({
    where: {
      isActive: true,
      startHour: { lte: currentHour },
      endHour: { gte: currentHour },
    },
    include: {
      user: {
        include: {
          pushSubscriptions: true,
        },
      },
    },
  });

  const results = [];

  for (const goal of goals) {
    // 하루 잔소리 횟수에 따라 이 시간에 보낼지 결정
    const hoursActive = goal.endHour - goal.startHour;
    const interval = Math.floor(hoursActive / goal.frequency);
    const hoursFromStart = currentHour - goal.startHour;

    // 이 시간이 잔소리 보낼 시간인지 확인
    if (interval > 0 && hoursFromStart % interval !== 0) {
      continue;
    }

    // 잔소리 생성
    const message = await generateJansori(
      goal.title,
      goal.intensity as 1 | 2 | 3
    );

    // 사용자의 모든 구독 기기에 푸시 전송
    for (const subscription of goal.user.pushSubscriptions) {
      const result = await sendPushNotification(
        {
          endpoint: subscription.endpoint,
          keys: {
            p256dh: subscription.p256dh,
            auth: subscription.auth,
          },
        },
        "🗣️ 잔소리 도착",
        message
      );

      results.push({
        goalId: goal.id,
        userId: goal.userId,
        success: result.success,
      });
    }

    // 로그 저장
    await db.jansoriLog.create({
      data: {
        goalId: goal.id,
        message,
      },
    });
  }

  return NextResponse.json({
    processed: goals.length,
    results,
    timestamp: now.toISOString(),
  });
}
