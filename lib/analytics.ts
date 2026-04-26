import { collection, addDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { db } from "./firebase";

export type EventType = "swipe_left" | "swipe_right" | "profile_view" | "photo_change" | "chat_opened";

export interface UserInteraction {
  userId: string;
  targetProfileId: string;
  eventType: EventType;
  timeSpentMs: number;
  timestamp: Timestamp | null;
  metadata?: Record<string, any>;
}

/**
 * Log a user interaction for ML feature tracking.
 */
export async function logInteraction(
  userId: string,
  targetProfileId: string,
  eventType: EventType,
  timeSpentMs: number = 0,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await addDoc(collection(db, "user_interactions"), {
      userId,
      targetProfileId,
      eventType,
      timeSpentMs,
      timestamp: serverTimestamp(),
      ...(metadata ? { metadata } : {})
    });
  } catch (error) {
    console.error("Failed to log interaction:", error);
  }
}
