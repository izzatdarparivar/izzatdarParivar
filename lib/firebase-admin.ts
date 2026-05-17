import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL || process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY || process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("CRITICAL: Missing Firebase Admin SDK configuration variables.");
    if (process.env.NODE_ENV === "production") {
      throw new Error("Missing Firebase Admin SDK configuration variables.");
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      // Handle escaped newlines in the private key
      privateKey: privateKey?.replace(/\\n/g, '\n'),
    }),
  });
}

import { NextRequest } from "next/server";

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
export const getAdminDb = () => admin.firestore();

export async function verifyAdmin(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("__session")?.value;
    const authHeader = req.headers.get("authorization");
    const token = sessionCookie || authHeader?.replace("Bearer ", "");

    if (!token) return null;
    
    const decoded = await adminAuth.verifyIdToken(token);
    if (decoded.role === "admin" || decoded.role === "moderator") {
      return decoded;
    }
    return null;
  } catch (error) {
    console.error("Admin verification failed", error);
    return null;
  }
}
