import { db } from "@/lib/firebase";
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp,
  updateDoc 
} from "firebase/firestore";
import { PlanTier } from "./pricing";

export interface UserSubscription {
  userId: string;
  tier: PlanTier;
  startDate: any;
  endDate: any;
  status: "active" | "expired" | "cancelled";
  paymentId?: string;
  orderId?: string;
}

/**
 * Get a user's current subscription details
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const ref = doc(db, "subscriptions", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserSubscription;
}

/**
 * Activate or update a subscription after payment
 */
export async function activateSubscription(
  userId: string, 
  tier: PlanTier, 
  days: number,
  paymentDetails: { paymentId: string, orderId: string }
) {
  const ref = doc(db, "subscriptions", userId);
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(startDate.getDate() + days);

  const subData: UserSubscription = {
    userId,
    tier,
    startDate: serverTimestamp(),
    endDate: endDate,
    status: "active",
    ...paymentDetails
  };

  await setDoc(ref, subData);
  
  // Also update the main user profile tier for quick access
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { tier });
}
