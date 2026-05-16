import { NextRequest, NextResponse } from "next/server";
import { generateIcebreakers, IcebreakerInput } from "@/lib/ai";
import { getAuth } from "firebase-admin/auth";


export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);


    const input: IcebreakerInput = await req.json();
    if (!input.senderName || !input.receiverName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    const icebreakers = await generateIcebreakers(input);
    return NextResponse.json({ icebreakers });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

