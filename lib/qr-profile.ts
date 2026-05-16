import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";


export interface QRProfile {
  userId: string;
  shortCode: string; // 6-char unique code
  url: string;
  scanCount: number;
  createdAt: any;
}


function generateShortCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}


export async function createQRProfile(userId: string): Promise<QRProfile> {
  // Check if already exists
  const existing = await getQRProfile(userId);
  if (existing) return existing;


  const shortCode = generateShortCode();
  const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://izzatdarparivar.com"}/p/${shortCode}`;


  const profile: QRProfile = {
    userId,
    shortCode,
    url,
    scanCount: 0,
    createdAt: new Date(),
  };


  await setDoc(doc(db, "qr_profiles", userId), profile);
  await setDoc(doc(db, "qr_codes", shortCode), { userId, shortCode });


  return profile;
}


export async function getQRProfile(userId: string): Promise<QRProfile | null> {
  const snap = await getDoc(doc(db, "qr_profiles", userId));
  if (!snap.exists()) return null;
  return snap.data() as QRProfile;
}


export async function resolveShortCode(shortCode: string): Promise<string | null> {
  const snap = await getDoc(doc(db, "qr_codes", shortCode));
  if (!snap.exists()) return null;
  return snap.data().userId;
}


export function getQRCodeDataUrl(text: string, size = 256): string {
  // Returns a URL for QR code image via a public API
  // In production, use a library like 'qrcode' to generate locally
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
}

