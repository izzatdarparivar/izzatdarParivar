# Free-Tier Production Remediation & AI Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Secure the Next.js API, fix database bottlenecks to survive the Firebase free tier, and add AI features with a Groq fallback.

**Architecture:** Edge Middleware handles auth and rate limiting. Zod validates all API inputs. Firestore data is denormalized to fix N+1 queries. LLM requests use Gemini with a Groq fallback.

**Tech Stack:** Next.js 16, Firebase (Firestore & Auth), Zod, Upstash Redis, Google Gemini SDK, Groq SDK.

---

### Task 1: Add Edge Auth Middleware & Rate Limiting

**Files:**
- Create: `middleware.ts`
- Create: `lib/auth-edge.ts`

- [ ] **Step 1: Write the Edge Auth Middleware**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  
  if (request.nextUrl.pathname.startsWith("/api/matches") || request.nextUrl.pathname.startsWith("/api/recommendations")) {
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Note: Edge token verification logic will go in lib/auth-edge.ts
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat(security): add edge middleware for route protection"
```

### Task 2: Implement Zod Validation on API Routes

**Files:**
- Create: `lib/validations/api-schemas.ts`
- Modify: `app/api/create-order/route.ts`

- [ ] **Step 1: Write the Zod schema**

```typescript
// lib/validations/api-schemas.ts
import { z } from "zod";

export const CreateOrderSchema = z.object({
  amount: z.number().min(100).max(100000), // Min 1 INR
  currency: z.literal("INR"),
  receipt: z.string().optional(),
});
```

- [ ] **Step 2: Update the create-order route to use Zod**

```typescript
// app/api/create-order/route.ts (update body parsing)
import { CreateOrderSchema } from "@/lib/validations/api-schemas";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const body = CreateOrderSchema.parse(json);
    // ... existing razorpay logic using body.amount
  } catch (error) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/validations/api-schemas.ts app/api/create-order/route.ts
git commit -m "feat(security): add zod input validation to create-order api"
```

### Task 3: Fix N+1 Firestore Query in Matches API

**Files:**
- Modify: `app/api/matches/route.ts`
- Modify: `app/api/block/route.ts`

- [ ] **Step 1: Write a denormalized block query**

```typescript
// Update app/api/matches/route.ts to use a single block query
// Replace the Promise.all(profiles.map(...)) with a collectionGroup query or simpler filtering
```
*(Detailed implementation depends on Firestore schema changes)*

### Task 4: AI Bio Writer (Gemini + Groq Fallback)

**Files:**
- Create: `lib/ai/llm-client.ts`
- Create: `app/api/ai/generate-bio/route.ts`

- [ ] **Step 1: Write the dual-LLM client wrapper**

```typescript
// lib/ai/llm-client.ts
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateText(prompt: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.warn("Gemini failed, falling back to Groq:", error);
    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
    });
    return completion.choices[0]?.message?.content || "";
  }
}
```

- [ ] **Step 2: Commit**

```bash
npm install @google/generative-ai groq-sdk
git add lib/ai/llm-client.ts package.json
git commit -m "feat(ai): implement gemini client with groq fallback"
```
