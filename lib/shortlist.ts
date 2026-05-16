import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";


export interface ShortlistEntry {
  profileId: string;
  addedAt: Timestamp | null;
  notes?: string;
}


export interface ValidationResult {
  valid: boolean;
  error?: string;
}


export function validateShortlistAction(userId: string, profileId: string): ValidationResult {
  if (!userId || !profileId) {
    return { valid: false, error: "User ID and profile ID are required" };
  }
  if (userId === profileId) {
    return { valid: false, error: "Cannot shortlist yourself" };
  }
  return { valid: true };
}


export async function addToShortlist(userId: string, profileId: string, notes?: string): Promise<{ success: boolean; error?: string }> {
  const validation = validateShortlistAction(userId, profileId);
  if (!validation.valid) return { success: false, error: validation.error };


  await setDoc(doc(db, "shortlists", userId, "profiles", profileId), {
    profileId,
    addedAt: serverTimestamp(),
    ...(notes ? { notes } : {}),
  });
  return { success: true };
}


export async function removeFromShortlist(userId: string, profileId: string): Promise<void> {
  await deleteDoc(doc(db, "shortlists", userId, "profiles", profileId));
}


export async function getShortlist(userId: string): Promise<ShortlistEntry[]> {
  const q = query(collection(db, "shortlists", userId, "profiles"), orderBy("addedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ShortlistEntry);
}


export async function isShortlisted(userId: string, profileId: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "shortlists", userId, "profiles", profileId));
  return snap.exists();
}

