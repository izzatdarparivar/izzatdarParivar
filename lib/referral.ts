import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";


export interface ReferralCode {
  code: string;
  userId: string;
  uses: number;
  maxUses: number;
  reward: "7_days_silver" | "30_days_silver" | "discount_20";
  createdAt: any;
}


export interface Referral {
  id?: string;
  referrerId: string;
  referredId: string;
  code: string;
  status: "pending" | "completed" | "rewarded";
  createdAt: any;
  completedAt?: any;
}


function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "IZZAT";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}


export async function createReferralCode(userId: string): Promise<string> {
  // Check if user already has a code
  const existing = await getReferralCode(userId);
  if (existing) return existing.code;


  const code = generateCode();
  const ref = doc(db, "referral_codes", code);
  await setDoc(ref, {
    code,
    userId,
    uses: 0,
    maxUses: 10,
    reward: "7_days_silver",
    createdAt: serverTimestamp(),
  });
  return code;
}


export async function getReferralCode(userId: string): Promise<ReferralCode | null> {
  const codesRef = collection(db, "referral_codes");
  const q = query(codesRef, where("userId", "==", userId));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].data() as ReferralCode;
}


export async function applyReferralCode(referredUserId: string, code: string): Promise<boolean> {
  const codeRef = doc(db, "referral_codes", code);
  const codeDoc = await getDoc(codeRef);
  if (!codeDoc.exists()) return false;


  const codeData = codeDoc.data() as ReferralCode;
  if (codeData.userId === referredUserId) return false; // Can't refer yourself
  if (codeData.uses >= codeData.maxUses) return false;


  // Create referral record
  const referralRef = doc(db, "referrals", `${code}_${referredUserId}`);
  await setDoc(referralRef, {
    referrerId: codeData.userId,
    referredId: referredUserId,
    code,
    status: "pending",
    createdAt: serverTimestamp(),
  });


  // Increment usage
  await updateDoc(codeRef, { uses: increment(1) });
  return true;
}


export async function completeReferral(referredUserId: string, code: string): Promise<void> {
  const referralRef = doc(db, "referrals", `${code}_${referredUserId}`);
  await updateDoc(referralRef, {
    status: "completed",
    completedAt: serverTimestamp(),
  });
}


export async function getReferralStats(userId: string): Promise<{ total: number; completed: number; pending: number }> {
  const referralsRef = collection(db, "referrals");
  const q = query(referralsRef, where("referrerId", "==", userId));
  const snap = await getDocs(q);


  let completed = 0;
  let pending = 0;
  snap.docs.forEach((d) => {
    const status = d.data().status;
    if (status === "completed" || status === "rewarded") completed++;
    else pending++;
  });


  return { total: snap.size, completed, pending };
}

