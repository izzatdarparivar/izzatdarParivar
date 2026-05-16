import { db } from "@/lib/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  getDoc,
  serverTimestamp,
  updateDoc,
  addDoc,
  orderBy,
} from "firebase/firestore";


export type ReportReason =
  | "fake_profile"
  | "harassment"
  | "inappropriate_content"
  | "underage"
  | "spam"
  | "other";


export interface Report {
  id?: string;
  reportedBy: string;
  reportedUser: string;
  reason: ReportReason;
  details: string;
  status: "pending" | "reviewed" | "action_taken" | "dismissed";
  createdAt: any;
  reviewedBy?: string;
  reviewedAt?: any;
  actionTaken?: string;
}


export interface Block {
  blockedUserId: string;
  blockedAt: any;
}


// ─── Block Functions ─────────────────────────────────────────────────────────


export async function blockUser(blockerId: string, blockedId: string): Promise<void> {
  if (blockerId === blockedId) throw new Error("Cannot block yourself");
  const blockRef = doc(db, "blocks", blockerId, "blockedUsers", blockedId);
  await setDoc(blockRef, { blockedUserId: blockedId, blockedAt: serverTimestamp() });
}


export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  const blockRef = doc(db, "blocks", blockerId, "blockedUsers", blockedId);
  await deleteDoc(blockRef);
}


export async function getBlockedUsers(userId: string): Promise<string[]> {
  const blocksRef = collection(db, "blocks", userId, "blockedUsers");
  const snapshot = await getDocs(blocksRef);
  return snapshot.docs.map((d) => d.data().blockedUserId);
}


export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const blockRef = doc(db, "blocks", blockerId, "blockedUsers", blockedId);
  const snap = await getDoc(blockRef);
  return snap.exists();
}


export async function isBlockedEither(userA: string, userB: string): Promise<boolean> {
  const [aBlocksB, bBlocksA] = await Promise.all([
    isBlocked(userA, userB),
    isBlocked(userB, userA),
  ]);
  return aBlocksB || bBlocksA;
}


// ─── Report Functions ────────────────────────────────────────────────────────


export async function submitReport(
  report: Omit<Report, "id" | "status" | "createdAt">
): Promise<string> {
  if (report.reportedBy === report.reportedUser) throw new Error("Cannot report yourself");
  const reportsRef = collection(db, "reports");
  const docRef = await addDoc(reportsRef, {
    ...report,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  await checkAutoSuspend(report.reportedUser);
  return docRef.id;
}


export async function getReportsForUser(userId: string): Promise<Report[]> {
  const reportsRef = collection(db, "reports");
  const q = query(reportsRef, where("reportedUser", "==", userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}


export async function getReportCount(userId: string): Promise<number> {
  const reportsRef = collection(db, "reports");
  const q = query(
    reportsRef,
    where("reportedUser", "==", userId),
    where("status", "in", ["pending", "action_taken"])
  );
  const snapshot = await getDocs(q);
  return snapshot.size;
}


export async function updateReportStatus(
  reportId: string,
  status: Report["status"],
  reviewerId: string,
  actionTaken?: string
): Promise<void> {
  const reportRef = doc(db, "reports", reportId);
  await updateDoc(reportRef, {
    status,
    reviewedBy: reviewerId,
    reviewedAt: serverTimestamp(),
    ...(actionTaken && { actionTaken }),
  });
}


export async function checkAutoSuspend(userId: string): Promise<boolean> {
  const count = await getReportCount(userId);
  if (count >= 3) {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { status: "suspended", suspendedAt: serverTimestamp() });
    return true;
  }
  return false;
}



