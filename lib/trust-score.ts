import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";


export interface TrustScore {
  userId: string;
  score: number; // 0-100
  breakdown: {
    profileCompletion: number; // 0-20
    verification: number;     // 0-25
    communityVouches: number; // 0-20
    activityScore: number;    // 0-15
    responsiveness: number;   // 0-10
    tenure: number;           // 0-10
  };
  vouches: number;
  updatedAt: any;
}


export interface Vouch {
  id?: string;
  voucherId: string;
  voucherName: string;
  vouchedUserId: string;
  relationship: "family" | "friend" | "colleague" | "community_member";
  message: string;
  createdAt: any;
}


export async function calculateTrustScore(userId: string): Promise<TrustScore> {
  const userDoc = await getDoc(doc(db, "users", userId));
  if (!userDoc.exists()) throw new Error("User not found");
  const userData = userDoc.data();


  // Profile completion (0-20)
  const requiredFields = ["name", "dob", "gender", "education", "occupation", "location", "religion", "bio", "photoURL", "phone"];
  const filledFields = requiredFields.filter((f) => userData[f]);
  const profileCompletion = Math.round((filledFields.length / requiredFields.length) * 20);


  // Verification (0-25)
  const verTypes = ["aadhaar", "pan", "education", "employment", "photo"];
  let verifiedCount = 0;
  for (const type of verTypes) {
    const verDoc = await getDoc(doc(db, "verifications", `${userId}_${type}`));
    if (verDoc.exists() && verDoc.data().status === "verified") verifiedCount++;
  }
  const verification = Math.round((verifiedCount / verTypes.length) * 25);


  // Community vouches (0-20)
  const vouchesRef = collection(db, "vouches");
  const vouchQuery = query(vouchesRef, where("vouchedUserId", "==", userId));
  const vouchSnap = await getDocs(vouchQuery);
  const vouchCount = vouchSnap.size;
  const communityVouches = Math.min(20, vouchCount * 4); // 5 vouches = max


  // Activity score (0-15)
  const createdAt = userData.createdAt?.toDate?.() || new Date();
  const daysSinceJoin = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
  const activityScore = Math.min(15, Math.round(daysSinceJoin / 7) * 3); // 5 weeks = max


  // Responsiveness (0-10)
  const responseRate = userData.responseRate || 0;
  const responsiveness = Math.round(responseRate * 10);


  // Tenure (0-10)
  const tenure = Math.min(10, Math.round(daysSinceJoin / 30) * 2); // 5 months = max


  const breakdown = {
    profileCompletion,
    verification,
    communityVouches,
    activityScore,
    responsiveness,
    tenure,
  };


  const score = Object.values(breakdown).reduce((sum, v) => sum + v, 0);


  const trustScore: TrustScore = {
    userId,
    score,
    breakdown,
    vouches: vouchCount,
    updatedAt: new Date(),
  };


  // Save
  await setDoc(doc(db, "trust_scores", userId), trustScore);
  return trustScore;
}


export async function getTrustScore(userId: string): Promise<TrustScore | null> {
  const ref = doc(db, "trust_scores", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as TrustScore;
}


export async function addVouch(vouch: Omit<Vouch, "id" | "createdAt">): Promise<string> {
  if (vouch.voucherId === vouch.vouchedUserId) throw new Error("Cannot vouch for yourself");
  // Check if already vouched
  const existing = query(
    collection(db, "vouches"),
    where("voucherId", "==", vouch.voucherId),
    where("vouchedUserId", "==", vouch.vouchedUserId)
  );
  const existingSnap = await getDocs(existing);
  if (!existingSnap.empty) throw new Error("Already vouched for this person");


  const docRef = await addDoc(collection(db, "vouches"), {
    ...vouch,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}


export async function getVouchesForUser(userId: string): Promise<Vouch[]> {
  const q = query(collection(db, "vouches"), where("vouchedUserId", "==", userId));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Vouch));
}

