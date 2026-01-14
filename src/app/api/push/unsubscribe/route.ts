import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 사용자의 모든 푸시 구독 삭제
  await db.pushSubscription.deleteMany({
    where: { userId: session.user.id },
  });

  return NextResponse.json({ success: true });
}
