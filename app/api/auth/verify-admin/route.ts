import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";


export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(token);
    const role = (decoded.role as string) || "user";

    return NextResponse.json({ uid: decoded.uid, role });
  } catch (error) {
    console.error("Token verification failed:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
