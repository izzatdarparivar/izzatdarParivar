import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";


export type ChatStatus = "pending" | "accepted" | "rejected";


export interface ChatSession {
  id?: string;
  participants: string[];
  status: ChatStatus;
  initiatorId: string;
  initiatorMessageCount: number;
  receiverMessageCount: number;
  lastMessage: string;
  updatedAt: Timestamp | null;
}


export interface ChatMessage {
  id?: string;
  sessionId: string;
  senderId: string;
  text: string;
  timestamp: Timestamp | null;
}


/** Get or create a chat session between two users */
export async function getOrCreateChatSession(uid1: string, uid2: string): Promise<string> {
  // Sort UIDs to maintain a consistent session ID or querying pattern
  // But we'll just query by array-contains-any or specific matching
  const q = query(
    collection(db, "chat_sessions"),
    where("participants", "array-contains", uid1)
  );
 
  const snap = await getDocs(q);
  let existingSession: any = null;
 
  snap.forEach((d) => {
    const data = d.data() as ChatSession;
    if (data.participants.includes(uid2)) {
      existingSession = { id: d.id, ...data };
    }
  });


  if (existingSession) {
    return existingSession.id;
  }


  // Create new
  const sessionRef = doc(collection(db, "chat_sessions"));
  const newSession: ChatSession = {
    participants: [uid1, uid2],
    status: "pending",
    initiatorId: uid1, // The one who creates it is initiator
    initiatorMessageCount: 0,
    receiverMessageCount: 0,
    lastMessage: "",
    updatedAt: serverTimestamp() as Timestamp,
  };


  await setDoc(sessionRef, newSession);
  return sessionRef.id;
}


/** Get a single session data */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  if (!sessionId) return null;
  const snap = await getDoc(doc(db, "chat_sessions", sessionId));
  return snap.exists() ? (snap.data() as ChatSession) : null;
}


/** Send a message */
export async function sendMessage(sessionId: string, senderId: string, text: string): Promise<boolean> {
  if (!sessionId) return false;
  const session = await getChatSession(sessionId);
  if (!session) return false;


  const isInitiator = senderId === session.initiatorId;


  // Enforce 3 message limit if pending
  if (session.status === "pending") {
    if (isInitiator && session.initiatorMessageCount >= 3) return false;
    if (!isInitiator && session.receiverMessageCount >= 3) return false;
  }


  // Add message
  await addDoc(collection(db, "chat_sessions", sessionId, "messages"), {
    sessionId,
    senderId,
    text,
    timestamp: serverTimestamp(),
  });


  // Update session
  await updateDoc(doc(db, "chat_sessions", sessionId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
    ...(isInitiator && session.status === "pending" ? { initiatorMessageCount: session.initiatorMessageCount + 1 } : {}),
    ...(!isInitiator && session.status === "pending" ? { receiverMessageCount: session.receiverMessageCount + 1 } : {})
  });


  return true;
}


/** Accept or reject chat */
export async function updateChatConsent(sessionId: string, status: "accepted" | "rejected"): Promise<void> {
  await updateDoc(doc(db, "chat_sessions", sessionId), {
    status,
    updatedAt: serverTimestamp(),
  });
}


/** Listen to messages (Real-time) */
export function subscribeToMessages(sessionId: string, callback: (messages: ChatMessage[]) => void) {
  if (!sessionId) return () => {};
  const q = query(
    collection(db, "chat_sessions", sessionId, "messages"),
    orderBy("timestamp", "asc")
  );


  return onSnapshot(q, (snap) => {
    const messages = snap.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ChatMessage[];
    callback(messages);
  });
}


/** Listen to all chat sessions for a user (Real-time) */
export function subscribeToChatSessions(uid: string, callback: (sessions: (ChatSession & { id: string })[]) => void) {
  const q = query(
    collection(db, "chat_sessions"),
    where("participants", "array-contains", uid)
  );


  return onSnapshot(q, (snap) => {
    const sessions = snap.docs.map(d => ({
      id: d.id,
      ...d.data()
    })) as (ChatSession & { id: string })[];
    // Sort by updatedAt descending (most recent first)
    sessions.sort((a, b) => {
      const aTime = a.updatedAt?.toMillis?.() || 0;
      const bTime = b.updatedAt?.toMillis?.() || 0;
      return bTime - aTime;
    });
    callback(sessions);
  });
}


/** Get the other participant's UID from a session */
export function getOtherParticipantId(session: ChatSession, currentUid: string): string {
  return session.participants.find(p => p !== currentUid) || "";
}



