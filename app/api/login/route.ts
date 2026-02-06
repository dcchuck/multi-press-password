import { NextResponse } from "next/server";
import { isThresholdMet } from "@/lib/state";

export async function POST() {
  if (!isThresholdMet()) {
    return NextResponse.json(
      { success: false, error: "You need the whole crew for a job like this." },
      { status: 403 }
    );
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("crew-authenticated", "true", {
    httpOnly: true,
    maxAge: 300,
    path: "/",
    sameSite: "lax",
  });

  return response;
}
