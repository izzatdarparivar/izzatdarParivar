import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";

export type NotificationType = "interest" | "message" | "match" | "system";

export interface AppNotification {
  id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  actionUrl?: string;
  fromUserId?: string;
  fromUserName?: string;
  fromUserPhoto?: string;
  createdAt: Timestamp | null;
}

/** Create a notification for a user */
export async function createNotification(
  data: Omit<AppNotification, "id" | "createdAt" | "read">
): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
}

/** Subscribe to notifications for a user (Real-time, newest first) */
export function subscribeToNotifications(
  uid: string,
  callback: (notifications: AppNotification[]) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as AppNotification[];
    callback(notifications);
  });
}

/** Mark a single notification as read */
export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), { read: true });
}

/** Mark all notifications as read for a user */
export async function markAllNotificationsRead(uid: string): Promise<void> {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", uid),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  if (snap.empty) return;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => {
    batch.update(d.ref, { read: true });
  });
  await batch.commit();
}

/** Subscribe to unread count (Real-time) */
export function subscribeToUnreadCount(
  uid: string,
  callback: (count: number) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", uid),
    where("read", "==", false)
  );

  return onSnapshot(q, (snap) => {
    callback(snap.size);
  });
}
