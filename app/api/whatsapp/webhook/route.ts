import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { processInput, createSession, getMessage, BotSession } from "@/lib/whatsapp-bot";


const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "izzatdar_verify_token";
const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || "";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || "";


// Webhook verification (GET)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");


  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}


// Message handler (POST)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];


    if (!message) {
      return NextResponse.json({ status: "no_message" });
    }


    const phone = message.from;
    const text = message.text?.body || "";


    // Get or create session
    let session = await getSession(phone);
    if (!session) {
      session = createSession(phone);
      await saveSession(phone, session);
    }


    // Process input
    const { newState, response } = processInput(session, text);
    session.state = newState;
    session.lastInteraction = new Date();
    await saveSession(phone, session);


    // Send response
    await sendWhatsAppMessage(phone, response);


    return NextResponse.json({ status: "ok" });
  } catch (e: any) {
    console.error("WhatsApp webhook error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


async function getSession(phone: string): Promise<BotSession | null> {
  const doc = await adminDb.collection("whatsapp_sessions").doc(phone).get();
  if (!doc.exists) return null;
  return doc.data() as BotSession;
}


async function saveSession(phone: string, session: BotSession): Promise<void> {
  await adminDb.collection("whatsapp_sessions").doc(phone).set(session);
}


async function sendWhatsAppMessage(to: string, text: string): Promise<void> {
  if (!WHATSAPP_TOKEN || !PHONE_NUMBER_ID) return;


  await fetch(`https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

