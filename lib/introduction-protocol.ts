import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";


export type IntroductionStage =
  | "interest_expressed"
  | "mutual_interest"
  | "initial_chat"
  | "family_introduction"
  | "meeting_arranged"
  | "decision";


export interface Introduction {
  id?: string;
  initiatorId: string;
  initiatorName: string;
  receiverId: string;
  receiverName: string;
  currentStage: IntroductionStage;
  stageHistory: { stage: IntroductionStage; enteredAt: any; notes?: string }[];
  familyApproval: {
    initiatorFamily: "pending" | "approved" | "declined";
    receiverFamily: "pending" | "approved" | "declined";
  };
  meetingDetails?: {
    date: string;
    time: string;
    location: string;
    type: "in_person" | "video";
    chaperoneRequired: boolean;
  };
  finalDecision?: {
    initiator: "accept" | "decline" | "pending";
    receiver: "accept" | "decline" | "pending";
  };
  createdAt: any;
  updatedAt: any;
}


const STAGE_ORDER: IntroductionStage[] = [
  "interest_expressed",
  "mutual_interest",
  "initial_chat",
  "family_introduction",
  "meeting_arranged",
  "decision",
];


export async function startIntroduction(
  initiatorId: string,
  initiatorName: string,
  receiverId: string,
  receiverName: string
): Promise<string> {
  const ref = collection(db, "introductions");
  const docRef = await addDoc(ref, {
    initiatorId,
    initiatorName,
    receiverId,
    receiverName,
    currentStage: "interest_expressed",
    stageHistory: [{ stage: "interest_expressed", enteredAt: new Date() }],
    familyApproval: { initiatorFamily: "pending", receiverFamily: "pending" },
    finalDecision: { initiator: "pending", receiver: "pending" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}


export async function advanceStage(introId: string, notes?: string): Promise<IntroductionStage> {
  const ref = doc(db, "introductions", introId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Introduction not found");


  const data = snap.data() as Introduction;
  const currentIndex = STAGE_ORDER.indexOf(data.currentStage);
  if (currentIndex >= STAGE_ORDER.length - 1) throw new Error("Already at final stage");


  const nextStage = STAGE_ORDER[currentIndex + 1];
  await updateDoc(ref, {
    currentStage: nextStage,
    stageHistory: [...data.stageHistory, { stage: nextStage, enteredAt: new Date(), notes }],
    updatedAt: serverTimestamp(),
  });


  return nextStage;
}


export async function setFamilyApproval(
  introId: string,
  side: "initiatorFamily" | "receiverFamily",
  status: "approved" | "declined"
): Promise<void> {
  const ref = doc(db, "introductions", introId);
  await updateDoc(ref, {
    [`familyApproval.${side}`]: status,
    updatedAt: serverTimestamp(),
  });
}


export async function setMeetingDetails(
  introId: string,
  details: Introduction["meetingDetails"]
): Promise<void> {
  const ref = doc(db, "introductions", introId);
  await updateDoc(ref, {
    meetingDetails: details,
    currentStage: "meeting_arranged",
    updatedAt: serverTimestamp(),
  });
}


export async function setFinalDecision(
  introId: string,
  party: "initiator" | "receiver",
  decision: "accept" | "decline"
): Promise<void> {
  const ref = doc(db, "introductions", introId);
  await updateDoc(ref, {
    [`finalDecision.${party}`]: decision,
    currentStage: "decision",
    updatedAt: serverTimestamp(),
  });
}


export async function getIntroduction(introId: string): Promise<Introduction | null> {
  const ref = doc(db, "introductions", introId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Introduction;
}


export function onIntroductionUpdate(introId: string, callback: (intro: Introduction) => void): () => void {
  const ref = doc(db, "introductions", introId);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) callback({ id: snap.id, ...snap.data() } as Introduction);
  });
}


export function getStageLabel(stage: IntroductionStage): string {
  const labels: Record<IntroductionStage, string> = {
    interest_expressed: "Interest Sent",
    mutual_interest: "Mutual Interest",
    initial_chat: "Getting to Know",
    family_introduction: "Family Introduction",
    meeting_arranged: "Meeting Arranged",
    decision: "Final Decision",
  };
  return labels[stage];
}


export function getStageIndex(stage: IntroductionStage): number {
  return STAGE_ORDER.indexOf(stage);
}

