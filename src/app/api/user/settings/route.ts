import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const ALLOWED_TIMEZONES = ["Asia/Seoul", "UTC"];

// 사용자 설정 조회
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { timezone: true },
  });

  return NextResponse.json({
    timezone: user?.timezone || "Asia/Seoul",
  });
}

// 사용자 설정 업데이트
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { timezone } = body;

  if (!ALLOWED_TIMEZONES.includes(timezone)) {
    return NextResponse.json(
      { error: "Invalid timezone. Allowed: " + ALLOWED_TIMEZONES.join(", ") },
      { status: 400 }
    );
  }

  const user = await db.user.update({
    where: { id: session.user.id },
    data: { timezone },
    select: { timezone: true },
  });

  return NextResponse.json({ timezone: user.timezone });
}
