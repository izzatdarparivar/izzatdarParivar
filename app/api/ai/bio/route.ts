import { NextRequest, NextResponse } from "next/server";
import { generateBio, BioGenerationInput } from "@/lib/ai";
import { getAuth } from "firebase-admin/auth";


export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    await getAuth().verifyIdToken(authHeader.split("Bearer ")[1]);


    const input: BioGenerationInput = await req.json();
    if (!input.name || !input.age || !input.gender) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }


    const bio = await generateBio(input);
    return NextResponse.json({ bio });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

