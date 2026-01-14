import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// 목표 조회
export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goal = await db.goal.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!goal) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  return NextResponse.json(goal);
}

// 목표 수정
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { title, description, intensity, frequency, startHour, endHour, isActive } = body;

  const goal = await db.goal.updateMany({
    where: { id, userId: session.user.id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(intensity !== undefined && { intensity }),
      ...(frequency !== undefined && { frequency }),
      ...(startHour !== undefined && { startHour }),
      ...(endHour !== undefined && { endHour }),
      ...(isActive !== undefined && { isActive }),
    },
  });

  if (goal.count === 0) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const updated = await db.goal.findUnique({ where: { id } });
  return NextResponse.json(updated);
}

// 목표 삭제
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const deleted = await db.goal.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
