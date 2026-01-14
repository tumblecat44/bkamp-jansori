import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint, p256dh, auth: authKey } = body;

  if (!endpoint || !p256dh || !authKey) {
    return NextResponse.json(
      { error: "Missing subscription data" },
      { status: 400 }
    );
  }

  // 기존 구독이 있으면 업데이트, 없으면 생성
  const existing = await db.pushSubscription.findFirst({
    where: { userId: session.user.id, endpoint },
  });

  if (existing) {
    await db.pushSubscription.update({
      where: { id: existing.id },
      data: { p256dh, auth: authKey },
    });
  } else {
    await db.pushSubscription.create({
      data: {
        userId: session.user.id,
        endpoint,
        p256dh,
        auth: authKey,
      },
    });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { endpoint } = body;

  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await db.pushSubscription.deleteMany({
    where: { userId: session.user.id, endpoint },
  });

  return NextResponse.json({ success: true });
}
