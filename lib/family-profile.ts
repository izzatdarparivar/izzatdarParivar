import { db } from "@/lib/firebase";
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
} from "firebase/firestore";


export interface FamilyMember {
  name: string;
  relation: string;
  occupation?: string;
  education?: string;
  age?: number;
}


export interface FamilyProfile {
  userId: string;
  familyType: "nuclear" | "joint" | "extended";
  familyValues: string[];
  familyIncome?: string;
  siblings: number;
  familyMembers: FamilyMember[];
  fatherOccupation?: string;
  motherOccupation?: string;
  familyBio?: string;
  ancestralOrigin?: string;
  familyTraditions?: string[];
  createdAt: any;
  updatedAt: any;
}


export interface PrivacySettings {
  userId: string;
  showPhone: "everyone" | "premium" | "matches" | "none";
  showEmail: "everyone" | "premium" | "matches" | "none";
  showFamilyDetails: "everyone" | "premium" | "matches" | "none";
  showIncome: "everyone" | "premium" | "matches" | "none";
  showPhotos: "everyone" | "premium" | "matches" | "none";
  profileVisibility: "all" | "premium_only" | "hidden";
  allowMessages: "everyone" | "matches" | "none";
  showOnlineStatus: boolean;
  showLastActive: boolean;
}


const DEFAULT_PRIVACY: Omit<PrivacySettings, "userId"> = {
  showPhone: "matches",
  showEmail: "matches",
  showFamilyDetails: "premium",
  showIncome: "premium",
  showPhotos: "everyone",
  profileVisibility: "all",
  allowMessages: "everyone",
  showOnlineStatus: true,
  showLastActive: true,
};


// ─── Family Profile ──────────────────────────────────────────────────────────


export async function createFamilyProfile(
  userId: string,
  data: Omit<FamilyProfile, "userId" | "createdAt" | "updatedAt">
): Promise<void> {
  const ref = doc(db, "family_profiles", userId);
  await setDoc(ref, {
    ...data,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}


export async function getFamilyProfile(userId: string): Promise<FamilyProfile | null> {
  const ref = doc(db, "family_profiles", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as FamilyProfile;
}


export async function updateFamilyProfile(
  userId: string,
  updates: Partial<FamilyProfile>
): Promise<void> {
  const ref = doc(db, "family_profiles", userId);
  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}


// ─── Privacy Settings ────────────────────────────────────────────────────────


export async function getPrivacySettings(userId: string): Promise<PrivacySettings> {
  const ref = doc(db, "privacy_settings", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { userId, ...DEFAULT_PRIVACY };
  return snap.data() as PrivacySettings;
}


export async function updatePrivacySettings(
  userId: string,
  updates: Partial<Omit<PrivacySettings, "userId">>
): Promise<void> {
  const ref = doc(db, "privacy_settings", userId);
  await setDoc(ref, { userId, ...DEFAULT_PRIVACY, ...updates }, { merge: true });
}


export function canViewField(
  viewerRelation: "self" | "match" | "premium" | "free",
  fieldSetting: string
): boolean {
  if (viewerRelation === "self") return true;
  switch (fieldSetting) {
    case "everyone":
      return true;
    case "premium":
      return viewerRelation === "premium" || viewerRelation === "match";
    case "matches":
      return viewerRelation === "match";
    case "none":
      return false;
    default:
      return false;
  }
}

