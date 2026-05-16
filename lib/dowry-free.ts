import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  where,
  serverTimestamp,
  orderBy,
  limit,
} from "firebase/firestore";


export interface DowryFreePledge {
  userId: string;
  userName: string;
  pledgedAt: any;
  message?: string;
  isPublic: boolean;
  verifiedBy?: string;
}


export async function takePledge(
  userId: string,
  userName: string,
  message?: string,
  isPublic = true
): Promise<void> {
  const ref = doc(db, "dowry_free_pledges", userId);
  await setDoc(ref, {
    userId,
    userName,
    pledgedAt: serverTimestamp(),
    message: message || "",
    isPublic,
  });
}


export async function hasPledge(userId: string): Promise<boolean> {
  const ref = doc(db, "dowry_free_pledges", userId);
  const snap = await getDoc(ref);
  return snap.exists();
}


export async function getPledge(userId: string): Promise<DowryFreePledge | null> {
  const ref = doc(db, "dowry_free_pledges", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as DowryFreePledge;
}


export async function getPublicPledges(limitNum = 50): Promise<DowryFreePledge[]> {
  const pledgesRef = collection(db, "dowry_free_pledges");
  const q = query(pledgesRef, where("isPublic", "==", true), orderBy("pledgedAt", "desc"), limit(limitNum));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as DowryFreePledge);
}


export async function getPledgeCount(): Promise<number> {
  const pledgesRef = collection(db, "dowry_free_pledges");
  const snap = await getDocs(pledgesRef);
  return snap.size;
}



