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
  height?: string;
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
  whatsapp?: string;
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


  // Structured name (new — backward-compatible, all optional)
  firstName?: string;
  middleName?: string;
  lastName?: string;


  // Enhanced demographics
  maritalStatus?: string;  // "Never Married" | "Divorced" | "Widowed" | "Awaiting Divorce"
  familyType?: string;     // "Nuclear" | "Joint" | "Other"
  diet?: string;           // "Vegetarian" | "Non-Vegetarian" | "Vegan" | "Eggetarian"
  lifestyle?: string;      // "Traditional" | "Moderate" | "Liberal"
  aboutFamily?: string;    // Free-text family background


  // Interests & hobbies
  hobbies?: string[];      // Array of hobby tags
  gotra?: string;          // Family lineage tag
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
  if (!snap.exists()) return null;
  return { uid: snap.id, ...snap.data() } as UserProfile;
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
  return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
}



/** Set a user's premium status (called after successful payment) */
export async function setPremiumStatus(uid: string): Promise<void> {
  await updateDoc(doc(db, "users", uid), {
    is_premium: true,
    updatedAt: serverTimestamp(),
  });
}



