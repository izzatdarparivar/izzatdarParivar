import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

export type CallPermissionResult = {
  allowed: boolean;
  reason?: "mutual_interest" | "active_chat" | "no_permission";
};

export async function canUserCall(
  callerId: string,
  receiverId: string
): Promise<CallPermissionResult> {
  // Check 1: Active/accepted chat session between the two users
  const chatQuery = query(
    collection(db, "chat_sessions"),
    where("participants", "array-contains", callerId)
  );
  const chatSnap = await getDocs(chatQuery);
  const hasActiveChat = chatSnap.docs.some(d => {
    const data = d.data();
    return data.participants.includes(receiverId) && data.status === "accepted";
  });

  if (hasActiveChat) return { allowed: true, reason: "active_chat" };

  // Check 2: Mutual accepted interest
  const sentQuery = query(
    collection(db, "interests"),
    where("fromUserId", "==", callerId),
    where("toUserId", "==", receiverId),
    where("status", "==", "accepted")
  );
  const sentSnap = await getDocs(sentQuery);
  if (!sentSnap.empty) return { allowed: true, reason: "mutual_interest" };

  const receivedQuery = query(
    collection(db, "interests"),
    where("fromUserId", "==", receiverId),
    where("toUserId", "==", callerId),
    where("status", "==", "accepted")
  );
  const receivedSnap = await getDocs(receivedQuery);
  if (!receivedSnap.empty) return { allowed: true, reason: "mutual_interest" };

  return { allowed: false, reason: "no_permission" };
}
