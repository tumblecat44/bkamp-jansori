import { NextRequest, NextResponse } from "next/server";
import { generateJansori } from "@/lib/groq";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { goal, intensity } = body;

  if (!goal) {
    return NextResponse.json({ error: "Goal is required" }, { status: 400 });
  }

  const message = await generateJansori(goal, intensity || 2);

  return NextResponse.json({ message });
}
