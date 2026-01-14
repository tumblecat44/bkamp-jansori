import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateJansori } from "@/lib/groq";
import { sendPushNotification } from "@/lib/push";

// 시간대별 현재 시간 계산
function getCurrentHour(timezone: string): number {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    hour12: false,
    timeZone: timezone,
  };
  const hour = parseInt(new Intl.DateTimeFormat("en-US", options).format(now));
  return hour;
}

// GitHub Actions Cron에서 호출됨
export async function GET(request: NextRequest) {
  // 인증 확인
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (token !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // 모든 활성 목표와 사용자 정보 조회
  const goals = await db.goal.findMany({
    where: {
      isActive: true,
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
    // 사용자의 시간대로 현재 시간 계산
    const userTimezone = goal.user.timezone || "Asia/Seoul";
    const currentHour = getCurrentHour(userTimezone);

    // 현재 시간이 목표의 시작~종료 시간 사이인지 확인
    if (currentHour < goal.startHour || currentHour > goal.endHour) {
      continue;
    }

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
        timezone: userTimezone,
        currentHour,
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
    processed: results.length,
    results,
    timestamp: now.toISOString(),
  });
}
