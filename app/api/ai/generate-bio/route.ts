import { NextRequest, NextResponse } from "next/server";
import { generateText } from "@/lib/ai/llm-client";
import { requireAuth } from "@/lib/api-auth";
import { z } from "zod";

const GenerateBioSchema = z.object({
  age: z.number().min(18).max(100),
  gender: z.string(),
  profession: z.string().min(2).max(100),
  hobbies: z.array(z.string()).max(5),
  vibe: z.enum(["traditional", "modern", "balanced"]).optional().default("balanced")
});

export async function POST(request: NextRequest) {
  try {
    const uid = await requireAuth(request);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const data = GenerateBioSchema.parse(body);

    const prompt = `Write a culturally appropriate, engaging short bio for a matrimonial profile.
Details:
- Age: ${data.age}
- Gender: ${data.gender}
- Profession: ${data.profession}
- Hobbies: ${data.hobbies.join(", ")}
- Tone: ${data.vibe}

Keep it under 3 sentences, optimistic, and natural. Do not use hashtags.`;

    const bio = await generateText(prompt);

    return NextResponse.json({ bio });
  } catch (error: any) {
    console.error("Bio generation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid input", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
