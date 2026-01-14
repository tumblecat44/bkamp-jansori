import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// 목표 목록 조회
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goals = await db.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(goals);
}

// 목표 생성
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, intensity, frequency, startHour, endHour } = body;

  if (!title) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const goal = await db.goal.create({
    data: {
      userId: session.user.id,
      title,
      description,
      intensity: intensity || 2,
      frequency: frequency || 3,
      startHour: startHour ?? 9,
      endHour: endHour ?? 22,
    },
  });

  return NextResponse.json(goal, { status: 201 });
}
