import { adminAuth } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";


/**
 * Extracts and verifies the Firebase ID token from the request.
 * Returns the authenticated user's UID, or null if unauthenticated.
 */
export async function requireAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const sessionCookie = req.cookies.get("__session")?.value;
  const token = authHeader?.replace("Bearer ", "") || sessionCookie;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    return null;
  }
}
