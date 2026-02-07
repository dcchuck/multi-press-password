import { NextResponse } from "next/server";
import { setPressed, removePressed, getActiveCount, isThresholdMet } from "@/lib/state";

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, pressing } = body as { userId: string; pressing: boolean };

  if (pressing) {
    setPressed(userId);
  } else {
    removePressed(userId);
  }

  return NextResponse.json({ activeCount: getActiveCount(), thresholdMet: isThresholdMet() });
}
