import { adminAuth } from "@/lib/firebase-admin";
import { NextRequest } from "next/server";

/**
 * Extracts and verifies the Firebase ID token from the request.
 * Enforces checkRevoked: true to ensure disabled/revoked sessions are immediately rejected.
 * Returns the authenticated user's UID, or null if unauthenticated.
 */
export async function requireAuth(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const sessionCookie = req.cookies.get("__session")?.value;
  const token = authHeader?.replace("Bearer ", "") || sessionCookie;
  if (!token) return null;
  try {
    // checkRevoked: true verifies against the Firebase Auth backend if the token was revoked
    const decoded = await adminAuth.verifyIdToken(token, true);
    return decoded.uid;
  } catch (err) {
    console.warn("Auth token verification failed or revoked:", err);
    return null;
  }
}
