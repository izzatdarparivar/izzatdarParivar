import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Handle escaped newlines in the private key
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
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
