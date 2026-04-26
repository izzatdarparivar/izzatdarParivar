import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserProfile {
  uid: string;
  name: string;
  gender: "male" | "female" | "other";
  dob: Timestamp | null;
  age?: number;
  location: string;
  religion: string;
  caste: string;
  motherTongue: string;
  education: string;
  occupation: string;
  annualIncome: string;
  bio: string;
  tagline?: string;
  photoURL: string;
  photos?: string[];
  phone: string;
  email: string;
  preferences: {
    minAge: number;
    maxAge: number;
    religion: string;
    location: string;
  };
  status: "pending" | "approved" | "rejected";
  is_premium: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

/** Create or overwrite a user document */
export async function createUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await setDoc(
    doc(db, "users", uid),
    {
      ...data,
      status: "pending",
      is_premium: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/** Read a single user document */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserProfile) : null;
}

/** Update partial fields on a user document */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/** Fetch all approved profiles for the matchmaking feed */
export async function getApprovedProfiles(): Promise<UserProfile[]> {
  const q = query(
    collection(db, "users"),
    where("status", "==", "approved")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserProfile);
}

/** Set a user's premium status (called after successful payment) */
export async function setPremiumStatus(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    is_premium: true,
    updatedAt: serverTimestamp(),
  });
}
