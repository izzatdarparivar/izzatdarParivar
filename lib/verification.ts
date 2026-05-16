import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";


export type VerificationType = "aadhaar" | "pan" | "education" | "employment" | "photo";


export type VerificationStatus = "pending" | "verified" | "rejected" | "expired";


export interface VerificationRecord {
  userId: string;
  type: VerificationType;
  status: VerificationStatus;
  documentUrl?: string;
  verifiedBy?: string;
  verifiedAt?: any;
  rejectionReason?: string;
  expiresAt?: any;
  submittedAt: any;
}


export interface VerificationBadges {
  userId: string;
  aadhaar: VerificationStatus;
  pan: VerificationStatus;
  education: VerificationStatus;
  employment: VerificationStatus;
  photo: VerificationStatus;
  overallTrust: number; // 0-100
}


export async function submitVerification(
  userId: string,
  type: VerificationType,
  documentUrl: string
): Promise<void> {
  const ref = doc(db, "verification_docs", `${userId}_${type}`);
  await setDoc(ref, {
    userId,
    type,
    status: "pending",
    documentUrl,
    submittedAt: serverTimestamp(),
  });
}


export async function getVerificationStatus(
  userId: string,
  type: VerificationType
): Promise<VerificationRecord | null> {
  const ref = doc(db, "verification_docs", `${userId}_${type}`);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as VerificationRecord;
}


export async function getVerificationBadges(userId: string): Promise<VerificationBadges> {
  const types: VerificationType[] = ["aadhaar", "pan", "education", "employment", "photo"];
  const badges: any = { userId };
  let verifiedCount = 0;


  for (const type of types) {
    const record = await getVerificationStatus(userId, type);
    badges[type] = record?.status || "pending";
    if (record?.status === "verified") verifiedCount++;
  }


  badges.overallTrust = Math.round((verifiedCount / types.length) * 100);
  return badges as VerificationBadges;
}


export async function approveVerification(
  userId: string,
  type: VerificationType,
  adminId: string
): Promise<void> {
  const ref = doc(db, "verifications", `${userId}_${type}`);
  await updateDoc(ref, {
    status: "verified",
    verifiedBy: adminId,
    verifiedAt: serverTimestamp(),
  });
}


export async function rejectVerification(
  userId: string,
  type: VerificationType,
  adminId: string,
  reason: string
): Promise<void> {
  const ref = doc(db, "verifications", `${userId}_${type}`);
  await updateDoc(ref, {
    status: "rejected",
    verifiedBy: adminId,
    verifiedAt: serverTimestamp(),
    rejectionReason: reason,
  });
}

