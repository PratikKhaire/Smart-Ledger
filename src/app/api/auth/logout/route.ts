import { NextResponse } from "next/server";
import { getTokenCookieOptions } from "@/lib/auth";

export async function POST() {
  const cookieOptions = getTokenCookieOptions();

  const response = NextResponse.json({ success: true });

  // Clear the token cookie
  response.cookies.set(cookieOptions.name, "", {
    maxAge: 0,
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  return response;
}
