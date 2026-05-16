import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { processIVRInput, createIVRSession, getWelcomeResponse, IVRSession } from "@/lib/ivr";


// IVR webhook handler for telephony provider (e.g., Exotel, Knowlarity)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { callerId, input, event } = body;


    if (!callerId) {
      return NextResponse.json({ error: "Missing callerId" }, { status: 400 });
    }


    // Handle call events
    if (event === "call_start") {
      const session = createIVRSession(callerId);
      await saveIVRSession(callerId, session);
      const response = getWelcomeResponse();
      return NextResponse.json(response);
    }


    if (event === "call_end") {
      await adminDb.collection("ivr_sessions").doc(callerId).delete();
      return NextResponse.json({ status: "session_cleared" });
    }


    // Handle DTMF/speech input
    const session = await getIVRSession(callerId);
    if (!session) {
      const newSession = createIVRSession(callerId);
      await saveIVRSession(callerId, newSession);
      return NextResponse.json(getWelcomeResponse());
    }


    const response = processIVRInput(session, input || "");


    // Update session state
    session.state = response.nextState;
    if (response.language === "hi-IN") session.language = "hi";
    if (response.language === "en-IN") session.language = "en";
    await saveIVRSession(callerId, session);


    return NextResponse.json(response);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


async function getIVRSession(callerId: string): Promise<IVRSession | null> {
  const doc = await adminDb.collection("ivr_sessions").doc(callerId).get();
  if (!doc.exists) return null;
  return doc.data() as IVRSession;
}


async function saveIVRSession(callerId: string, session: IVRSession): Promise<void> {
  await adminDb.collection("ivr_sessions").doc(callerId).set({
    ...session,
    lastInteraction: new Date(),
  });
}

