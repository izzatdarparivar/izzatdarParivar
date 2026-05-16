import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";


export type InterestStatus = "pending" | "accepted" | "declined" | "expired";
export type InterestAction = "send" | "accept" | "decline";


export interface Interest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: InterestStatus;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
}


export interface ValidationResult {
  valid: boolean;
  error?: string;
}


export function validateInterestAction(fromUserId: string, toUserId: string, action: InterestAction): ValidationResult {
  if (action === "send" && fromUserId === toUserId) {
    return { valid: false, error: "Cannot send interest to yourself" };
  }
  const validActions: InterestAction[] = ["send", "accept", "decline"];
  if (!validActions.includes(action)) {
    return { valid: false, error: "Invalid action" };
  }
  return { valid: true };
}


import { createNotification } from "./notifications";
import { getUserProfile } from "./firestore";


export async function sendInterest(fromUserId: string, toUserId: string): Promise<{ success: boolean; error?: string; isMutual?: boolean }> {
  const validation = validateInterestAction(fromUserId, toUserId, "send");
  if (!validation.valid) return { success: false, error: validation.error };


  const existing = await getInterestBetween(fromUserId, toUserId);
  if (existing) return { success: false, error: "Interest already sent" };


  const fromProfile = await getUserProfile(fromUserId);


  const reverse = await getInterestBetween(toUserId, fromUserId);
  if (reverse && reverse.status === "pending") {
    // MUTUAL MATCH
    await updateDoc(doc(db, "interests", reverse.id!), { status: "accepted" });
    await addDoc(collection(db, "interests"), {
      fromUserId, toUserId, status: "accepted",
      createdAt: serverTimestamp(), expiresAt: null,
    });


    // Notify both
    await createNotification({
      userId: toUserId,
      type: "match",
      title: "It's a Match! 🎉",
      body: `You and ${fromProfile?.name || "someone"} liked each other!`,
      fromUserId,
      fromUserName: fromProfile?.name,
      fromUserPhoto: fromProfile?.photoURL,
      actionUrl: "/chat",
    });


    return { success: true, isMutual: true };
  }


  // SINGLE INTEREST
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
  await addDoc(collection(db, "interests"), {
    fromUserId, toUserId, status: "pending",
    createdAt: serverTimestamp(), expiresAt,
  });


  // Notify recipient
  await createNotification({
    userId: toUserId,
    type: "interest",
    title: "New Interest! ❤️",
    body: `${fromProfile?.name || "Someone"} is interested in your profile.`,
    fromUserId,
    fromUserName: fromProfile?.name,
    fromUserPhoto: fromProfile?.photoURL,
    actionUrl: `/profile/${fromUserId}`,
  });


  return { success: true, isMutual: false };
}



export async function acceptInterest(interestId: string): Promise<void> {
  await updateDoc(doc(db, "interests", interestId), { status: "accepted" });
}


export async function declineInterest(interestId: string): Promise<void> {
  await updateDoc(doc(db, "interests", interestId), { status: "declined" });
}


export async function getInterestBetween(fromUserId: string, toUserId: string): Promise<(Interest & { id: string }) | null> {
  const q = query(
    collection(db, "interests"),
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Interest & { id: string };
}


export async function getReceivedInterests(userId: string, status?: InterestStatus): Promise<(Interest & { id: string })[]> {
  let q;
  if (status) {
    q = query(collection(db, "interests"), where("toUserId", "==", userId), where("status", "==", status), orderBy("createdAt", "desc"));
  } else {
    q = query(collection(db, "interests"), where("toUserId", "==", userId), orderBy("createdAt", "desc"));
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest & { id: string }));
}


export async function getSentInterests(userId: string): Promise<(Interest & { id: string })[]> {
  const q = query(collection(db, "interests"), where("fromUserId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest & { id: string }));
}


export async function countPendingInterests(userId: string): Promise<number> {
  const q = query(collection(db, "interests"), where("toUserId", "==", userId), where("status", "==", "pending"));
  const snap = await getDocs(q);
  return snap.size;
}

