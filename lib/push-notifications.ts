import { db } from "@/lib/firebase";
import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { app } from "@/lib/firebase";


export interface PushSubscription {
  userId: string;
  fcmToken: string;
  platform: "web" | "android" | "ios";
  createdAt: any;
  lastActive: any;
}


export interface NotificationPreferences {
  userId: string;
  newMatch: boolean;
  newMessage: boolean;
  interestReceived: boolean;
  profileView: boolean;
  systemUpdates: boolean;
  promotions: boolean;
  quietHoursStart?: string; // "22:00"
  quietHoursEnd?: string;   // "08:00"
}


const DEFAULT_PREFERENCES: Omit<NotificationPreferences, "userId"> = {
  newMatch: true,
  newMessage: true,
  interestReceived: true,
  profileView: true,
  systemUpdates: true,
  promotions: false,
};


export async function requestNotificationPermission(): Promise<string | null> {
  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;


    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });
    return token;
  } catch {
    return null;
  }
}


export async function saveSubscription(userId: string, fcmToken: string): Promise<void> {
  const ref = doc(db, "push_subscriptions", userId);
  await setDoc(ref, {
    userId,
    fcmToken,
    platform: "web",
    createdAt: new Date(),
    lastActive: new Date(),
  });
}


export async function removeSubscription(userId: string): Promise<void> {
  const ref = doc(db, "push_subscriptions", userId);
  await deleteDoc(ref);
}


export async function getPreferences(userId: string): Promise<NotificationPreferences> {
  const ref = doc(db, "notification_preferences", userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { userId, ...DEFAULT_PREFERENCES };
  return snap.data() as NotificationPreferences;
}


export async function updatePreferences(
  userId: string,
  updates: Partial<Omit<NotificationPreferences, "userId">>
): Promise<void> {
  const ref = doc(db, "notification_preferences", userId);
  await setDoc(ref, { userId, ...DEFAULT_PREFERENCES, ...updates }, { merge: true });
}


export function onForegroundMessage(callback: (payload: any) => void): () => void {
  try {
    const messaging = getMessaging(app);
    return onMessage(messaging, (payload) => {
      callback(payload);
    });
  } catch {
    return () => {};
  }
}

