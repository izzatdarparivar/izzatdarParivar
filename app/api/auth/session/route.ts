import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();
    if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

    // Verify token to ensure it's valid
    await adminAuth.verifyIdToken(token);
    
    // 5 days
    const expiresIn = 60 * 60 * 24 * 5;
    
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: "__session",
      value: token,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("__session");
  return response;
}
