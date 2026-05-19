# Phase B: Infrastructure & Security Remediation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement Cloudinary direct uploads (with a strict 6-image limit), apply Zod schemas to all remaining API routes, configure Upstash rate limiting, and secure the Razorpay webhook.

**Tech Stack:** Next.js App Router, Cloudinary SDK, Upstash Ratelimit, Zod.

---

### Task 1: Cloudinary Uploads & 6-Image Limit

**Files:**
- Create: `app/api/upload/route.ts` (Signature generator for direct uploads)
- Modify: `lib/validations/api-schemas.ts` (Add profile schema with max 6 images)
- Modify: `app/profile/create/page.tsx` (or equivalent UI to restrict uploads to 6)

- [ ] **Step 1: Create Cloudinary Signature Endpoint**
```typescript
// app/api/upload/route.ts
import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const uid = await requireAuth(request as any);
    if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder: `profiles/${uid}` },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({ timestamp, signature });
  } catch (error) {
    return NextResponse.json({ error: "Failed to sign" }, { status: 500 });
  }
}
```

- [ ] **Step 2: Add 6-Image Limit to Zod Schema**
```typescript
// lib/validations/api-schemas.ts
export const UpdateProfileSchema = z.object({
  // ... other fields
  photos: z.array(z.string().url()).max(6, "You can upload a maximum of 6 pictures."),
});
```

- [ ] **Step 3: Commit**
```bash
npm install cloudinary
git add .
git commit -m "feat(media): integrate cloudinary with 6 image limit"
```

- [ ] **Step 4: Update UI & Add Animations**
```typescript
// Modify app/profile/create/page.tsx (or the image upload component)
// 1. Add framer-motion for smooth entrance/exit of image previews
// 2. Disable upload button when images.length >= 6
// 3. Show a toast or animated warning if they try to upload more
```
```bash
npm install framer-motion
git add .
git commit -m "feat(ui): add 6-image limit UI constraints and smooth animations"
```

### Task 2: Apply Zod Validation to Remaining Routes

**Files:**
- Modify: `lib/validations/api-schemas.ts`
- Modify: `app/api/block/route.ts`
- Modify: `app/api/report/route.ts`

- [ ] **Step 1: Add Schemas**
```typescript
// lib/validations/api-schemas.ts
export const BlockUserSchema = z.object({
  blockedId: z.string().min(1),
  action: z.enum(["block", "unblock"]).optional().default("block"),
});

export const ReportUserSchema = z.object({
  reportedUserId: z.string().min(1),
  reason: z.string().min(10).max(500),
});
```

- [ ] **Step 2: Apply in API Routes**
Update `/api/block` and `/api/report` to use `.parse(json)` similar to Task 2 in the previous plan.

- [ ] **Step 3: Commit**
```bash
git add .
git commit -m "feat(security): enforce zod schemas on block and report apis"
```

### Task 3: Upstash Rate Limiting at the Edge

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Install & Configure Ratelimit**
```bash
npm install @upstash/ratelimit @upstash/redis
```

- [ ] **Step 2: Update Middleware**
```typescript
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse, NextRequest } from "next/server";

const redis = Redis.fromEnv();
// 10 requests per 10 seconds per IP
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function middleware(request: NextRequest) {
  const ip = request.ip || "127.0.0.1";
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
  }
  
  // ... existing auth middleware logic
  return NextResponse.next();
}
```

- [ ] **Step 3: Commit**
```bash
git add middleware.ts package.json package-lock.json
git commit -m "feat(security): implement upstash global rate limiting"
```

### Task 4: Razorpay Webhook HMAC Verification

**Files:**
- Create: `app/api/webhook/razorpay/route.ts`

- [ ] **Step 1: Implement Webhook Verification**
```typescript
// app/api/webhook/razorpay/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");
    
  if (expectedSignature !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  
  const event = JSON.parse(body);
  // Process event (e.g. payment.captured)
  
  return NextResponse.json({ status: "ok" });
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/webhook/razorpay/route.ts
git commit -m "feat(security): verify razorpay webhook hmac signature"
```
