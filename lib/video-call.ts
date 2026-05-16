import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";


export interface CallSession {
  id?: string;
  callerId: string;
  callerName: string;
  receiverId: string;
  receiverName: string;
  type: "video" | "voice";
  status: "ringing" | "active" | "ended" | "missed" | "declined";
  startedAt?: any;
  endedAt?: any;
  duration?: number; // seconds
  createdAt: any;
}


export interface RTCSignal {
  type: "offer" | "answer" | "ice-candidate";
  from: string;
  to: string;
  data: any;
}


// ─── Call Management ─────────────────────────────────────────────────────────


export async function initiateCall(
  callerId: string,
  callerName: string,
  receiverId: string,
  receiverName: string,
  type: "video" | "voice"
): Promise<string> {
  const callsRef = collection(db, "calls");
  const docRef = await addDoc(callsRef, {
    callerId,
    callerName,
    receiverId,
    receiverName,
    type,
    status: "ringing",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}


export async function answerCall(callId: string): Promise<void> {
  const callRef = doc(db, "calls", callId);
  await updateDoc(callRef, { status: "active", startedAt: serverTimestamp() });
}


export async function endCall(callId: string): Promise<void> {
  const callRef = doc(db, "calls", callId);
  const callDoc = await getDoc(callRef);
  if (!callDoc.exists()) return;
  const data = callDoc.data();
  const startedAt = data.startedAt?.toDate?.();
  const duration = startedAt ? Math.floor((Date.now() - startedAt.getTime()) / 1000) : 0;
  await updateDoc(callRef, { status: "ended", endedAt: serverTimestamp(), duration });
}


export async function declineCall(callId: string): Promise<void> {
  const callRef = doc(db, "calls", callId);
  await updateDoc(callRef, { status: "declined", endedAt: serverTimestamp() });
}


export function onCallStatusChange(callId: string, callback: (call: CallSession) => void): () => void {
  const callRef = doc(db, "calls", callId);
  return onSnapshot(callRef, (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() } as CallSession);
    }
  });
}


// ─── WebRTC Signaling via Firestore ──────────────────────────────────────────


export async function sendSignal(callId: string, signal: RTCSignal): Promise<void> {
  const signalsRef = collection(db, "calls", callId, "signals");
  await addDoc(signalsRef, { ...signal, timestamp: serverTimestamp() });
}


export function onSignal(callId: string, userId: string, callback: (signal: RTCSignal) => void): () => void {
  const signalsRef = collection(db, "calls", callId, "signals");
  return onSnapshot(signalsRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const data = change.doc.data() as RTCSignal;
        if (data.to === userId) {
          callback(data);
        }
      }
    });
  });
}


// ─── Scheduled Meetings ──────────────────────────────────────────────────────


export interface ScheduledMeeting {
  id?: string;
  organizerId: string;
  organizerName: string;
  participantId: string;
  participantName: string;
  scheduledAt: any;
  duration: number; // minutes
  type: "video" | "voice";
  status: "scheduled" | "completed" | "cancelled";
  notes?: string;
  createdAt: any;
}


export async function scheduleMeeting(
  data: Omit<ScheduledMeeting, "id" | "status" | "createdAt">
): Promise<string> {
  const meetingsRef = collection(db, "scheduled_meetings");
  const docRef = await addDoc(meetingsRef, {
    ...data,
    status: "scheduled",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}


export async function cancelMeeting(meetingId: string): Promise<void> {
  const ref = doc(db, "scheduled_meetings", meetingId);
  await updateDoc(ref, { status: "cancelled" });
}


export function onMeetingUpdate(meetingId: string, callback: (meeting: ScheduledMeeting) => void): () => void {
  const ref = doc(db, "scheduled_meetings", meetingId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() } as ScheduledMeeting);
  });
}

