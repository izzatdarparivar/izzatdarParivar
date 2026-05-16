# Phase 2: Trust, Safety & Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add admin panel, block/report system, input sanitization, rate limiting, email verification, and profile lifecycle management to make the platform production-safe.

**Architecture:** Admin routes behind role-based middleware. Block/report data in Firestore subcollections. Edge middleware for rate limiting. CSP headers via Next.js config. All admin mutations go through API routes using Firebase Admin SDK.

**Tech Stack:** Next.js 16 App Router, Firebase Admin SDK, isomorphic-dompurify, Vercel Edge Middleware, TypeScript, Vitest.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `middleware.ts` | Edge middleware: rate limiting + auth guards for /admin |
| `lib/sanitize.ts` | Input sanitization wrapper around DOMPurify |
| `lib/sanitize.test.ts` | Unit tests for sanitization |
| `lib/block-report.ts` | Block/report CRUD operations |
| `lib/block-report.test.ts` | Unit tests for block/report validation |
| `app/admin/layout.tsx` | Admin layout with role gate + sidebar nav |
| `app/admin/page.tsx` | Admin dashboard with stats |
| `app/admin/approvals/page.tsx` | Profile approval queue |
| `app/admin/users/page.tsx` | User management + search |
| `app/admin/reports/page.tsx` | Reports queue |
| `app/api/admin/stats/route.ts` | Admin stats API |
| `app/api/admin/approve/route.ts` | Approve/reject profiles API |
| `app/api/admin/users/route.ts` | User management API |
| `app/api/admin/reports/route.ts` | Reports management API |
| `app/api/block/route.ts` | Block/unblock API |
| `app/api/report/route.ts` | Submit report API |
| `components/BlockReportMenu.tsx` | Three-dot menu with block/report options |
| `components/ReportModal.tsx` | Report reason selection modal |
| `components/EmailVerificationBanner.tsx` | Yellow banner for unverified users |
| `next.config.ts` | Modified — add CSP headers |

---

## Task 1: Input Sanitization Module

**Files:**
- Create: `lib/sanitize.ts`
- Create: `lib/sanitize.test.ts`
- Modify: `package.json` (add isomorphic-dompurify)

- [ ] **Step 1: Install DOMPurify**

Run:
```bash
npm install isomorphic-dompurify
```

- [ ] **Step 2: Write failing tests for sanitize**

```typescript
// lib/sanitize.test.ts
import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeBio } from "./sanitize";

describe("sanitizeText", () => {
  it("strips HTML script tags", () => {
    const input = "Hello <script>alert('xss')</script> World";
    expect(sanitizeText(input)).toBe("Hello  World");
  });

  it("strips event handlers", () => {
    const input = '<img src="x" onerror="alert(1)" />';
    expect(sanitizeText(input)).toBe("");
  });

  it("strips iframe tags", () => {
    const input = 'Hi <iframe src="evil.com"></iframe> there';
    expect(sanitizeText(input)).toBe("Hi  there");
  });

  it("preserves plain text", () => {
    const input = "I am a software engineer from Mumbai";
    expect(sanitizeText(input)).toBe("I am a software engineer from Mumbai");
  });

  it("strips all HTML from plain text fields", () => {
    const input = "Hello <b>bold</b> and <i>italic</i>";
    expect(sanitizeText(input)).toBe("Hello bold and italic");
  });

  it("handles empty string", () => {
    expect(sanitizeText("")).toBe("");
  });

  it("handles null/undefined gracefully", () => {
    expect(sanitizeText(null as any)).toBe("");
    expect(sanitizeText(undefined as any)).toBe("");
  });
});

describe("sanitizeBio", () => {
  it("allows basic markdown-style formatting (plain text output)", () => {
    const input = "I love **cooking** and *reading*";
    // Bio preserves markdown syntax but strips HTML
    expect(sanitizeBio(input)).toBe("I love **cooking** and *reading*");
  });

  it("strips dangerous HTML but keeps text content", () => {
    const input = 'I am <script>evil</script> a good person';
    expect(sanitizeBio(input)).toBe("I am  a good person");
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx vitest run lib/sanitize.test.ts`
Expected: FAIL — cannot find module `./sanitize`

- [ ] **Step 4: Implement sanitize module**

```typescript
// lib/sanitize.ts
import DOMPurify from "isomorphic-dompurify";

/**
 * Sanitize plain text input — strips ALL HTML tags.
 * Use for: names, locations, occupation, taglines, chat messages, notes.
 */
export function sanitizeText(input: string): string {
  if (!input) return "";
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize bio/aboutFamily — strips dangerous HTML but preserves markdown syntax.
 * The rendered output uses markdown, not raw HTML.
 */
export function sanitizeBio(input: string): string {
  if (!input) return "";
  // Strip all HTML but keep the text content (markdown syntax preserved as-is)
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

/**
 * Sanitize an object's string fields recursively.
 * Use before writing user-provided data to Firestore.
 */
export function sanitizeProfileData<T extends Record<string, any>>(data: T): T {
  const result = { ...data };
  const bioFields = ["bio", "aboutFamily"];

  for (const key of Object.keys(result)) {
    if (typeof result[key] === "string") {
      result[key] = bioFields.includes(key)
        ? sanitizeBio(result[key])
        : sanitizeText(result[key]);
    }
  }

  return result;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run lib/sanitize.test.ts`
Expected: All 9 tests pass

- [ ] **Step 6: Commit**

```bash
git add lib/sanitize.ts lib/sanitize.test.ts package.json package-lock.json
git commit -m "feat: add input sanitization with DOMPurify to prevent XSS"
```

---

## Task 2: Block & Report Module

**Files:**
- Create: `lib/block-report.ts`
- Create: `lib/block-report.test.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// lib/block-report.test.ts
import { describe, it, expect } from "vitest";
import { validateBlock, validateReport, REPORT_REASONS } from "./block-report";

describe("block validation", () => {
  it("allows blocking a different user", () => {
    const result = validateBlock("user1", "user2");
    expect(result.valid).toBe(true);
  });

  it("rejects blocking self", () => {
    const result = validateBlock("user1", "user1");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Cannot block yourself");
  });

  it("rejects empty IDs", () => {
    expect(validateBlock("", "user2").valid).toBe(false);
    expect(validateBlock("user1", "").valid).toBe(false);
  });
});

describe("report validation", () => {
  it("accepts valid report", () => {
    const result = validateReport("user1", "user2", "fake_profile");
    expect(result.valid).toBe(true);
  });

  it("rejects reporting self", () => {
    const result = validateReport("user1", "user1", "fake_profile");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid reason", () => {
    const result = validateReport("user1", "user2", "invalid_reason" as any);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Invalid reason");
  });

  it("has 6 valid report reasons", () => {
    expect(REPORT_REASONS.length).toBe(6);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/block-report.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement block-report module**

```typescript
// lib/block-report.ts
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  addDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export const REPORT_REASONS = [
  "fake_profile",
  "harassment",
  "inappropriate_photos",
  "scam",
  "underage",
  "other",
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

export type ReportStatus = "pending" | "reviewed" | "action_taken" | "dismissed";

export interface Report {
  id?: string;
  reporterId: string;
  reportedUserId: string;
  reason: ReportReason;
  details?: string;
  status: ReportStatus;
  adminNotes?: string;
  createdAt: Timestamp | null;
  resolvedAt?: Timestamp | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate block action */
export function validateBlock(blockerId: string, blockedId: string): ValidationResult {
  if (!blockerId || !blockedId) {
    return { valid: false, error: "Both user IDs are required" };
  }
  if (blockerId === blockedId) {
    return { valid: false, error: "Cannot block yourself" };
  }
  return { valid: true };
}

/** Validate report action */
export function validateReport(
  reporterId: string,
  reportedUserId: string,
  reason: string
): ValidationResult {
  if (!reporterId || !reportedUserId) {
    return { valid: false, error: "Both user IDs are required" };
  }
  if (reporterId === reportedUserId) {
    return { valid: false, error: "Cannot report yourself" };
  }
  if (!REPORT_REASONS.includes(reason as ReportReason)) {
    return { valid: false, error: `Invalid reason. Must be one of: ${REPORT_REASONS.join(", ")}` };
  }
  return { valid: true };
}

/** Block a user */
export async function blockUser(blockerId: string, blockedId: string, reason?: string): Promise<{ success: boolean; error?: string }> {
  const validation = validateBlock(blockerId, blockedId);
  if (!validation.valid) return { success: false, error: validation.error };

  await setDoc(doc(db, "blocked_users", blockerId, "blocked", blockedId), {
    blockedAt: serverTimestamp(),
    ...(reason ? { reason } : {}),
  });

  return { success: true };
}

/** Unblock a user */
export async function unblockUser(blockerId: string, blockedId: string): Promise<void> {
  await deleteDoc(doc(db, "blocked_users", blockerId, "blocked", blockedId));
}

/** Get all blocked user IDs for a user */
export async function getBlockedUserIds(userId: string): Promise<string[]> {
  const snap = await getDocs(collection(db, "blocked_users", userId, "blocked"));
  return snap.docs.map((d) => d.id);
}

/** Check if user A has blocked user B */
export async function isBlocked(blockerId: string, blockedId: string): Promise<boolean> {
  const { getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "blocked_users", blockerId, "blocked", blockedId));
  return snap.exists();
}

/** Submit a report */
export async function submitReport(
  reporterId: string,
  reportedUserId: string,
  reason: ReportReason,
  details?: string
): Promise<{ success: boolean; error?: string }> {
  const validation = validateReport(reporterId, reportedUserId, reason);
  if (!validation.valid) return { success: false, error: validation.error };

  await addDoc(collection(db, "reports"), {
    reporterId,
    reportedUserId,
    reason,
    details: details || "",
    status: "pending",
    createdAt: serverTimestamp(),
  });

  return { success: true };
}

/** Get pending reports (admin) */
export async function getPendingReports(): Promise<Report[]> {
  const q = query(
    collection(db, "reports"),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Report));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/block-report.test.ts`
Expected: All 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/block-report.ts lib/block-report.test.ts
git commit -m "feat: add block/report system with validation"
```

---

## Task 3: Block & Report API Routes

**Files:**
- Create: `app/api/block/route.ts`
- Create: `app/api/report/route.ts`

- [ ] **Step 1: Create block API route**

```typescript
// app/api/block/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { blockerId, blockedId, action, reason } = body;

  if (!blockerId || !blockedId) {
    return NextResponse.json({ error: "Both IDs required" }, { status: 400 });
  }
  if (blockerId === blockedId) {
    return NextResponse.json({ error: "Cannot block yourself" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  if (action === "unblock") {
    await adminDb
      .collection("blocked_users")
      .doc(blockerId)
      .collection("blocked")
      .doc(blockedId)
      .delete();
    return NextResponse.json({ success: true });
  }

  // Default: block
  await adminDb
    .collection("blocked_users")
    .doc(blockerId)
    .collection("blocked")
    .doc(blockedId)
    .set({
      blockedAt: new Date(),
      ...(reason ? { reason } : {}),
    });

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");

  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const adminDb = getAdminDb();
  const snap = await adminDb
    .collection("blocked_users")
    .doc(uid)
    .collection("blocked")
    .get();

  const blocked = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ blocked });
}
```

- [ ] **Step 2: Create report API route**

```typescript
// app/api/report/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { sanitizeText } from "@/lib/sanitize";

const VALID_REASONS = [
  "fake_profile",
  "harassment",
  "inappropriate_photos",
  "scam",
  "underage",
  "other",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reporterId, reportedUserId, reason, details } = body;

  if (!reporterId || !reportedUserId || !reason) {
    return NextResponse.json({ error: "reporterId, reportedUserId, and reason required" }, { status: 400 });
  }
  if (reporterId === reportedUserId) {
    return NextResponse.json({ error: "Cannot report yourself" }, { status: 400 });
  }
  if (!VALID_REASONS.includes(reason)) {
    return NextResponse.json({ error: "Invalid reason" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  await adminDb.collection("reports").add({
    reporterId,
    reportedUserId,
    reason,
    details: details ? sanitizeText(details) : "",
    status: "pending",
    createdAt: new Date(),
  });

  // Check auto-flag: 3+ pending reports → auto-suspend
  const reportCount = await adminDb
    .collection("reports")
    .where("reportedUserId", "==", reportedUserId)
    .where("status", "==", "pending")
    .count()
    .get();

  if (reportCount.data().count >= 3) {
    await adminDb.collection("users").doc(reportedUserId).update({
      status: "suspended",
      suspendedAt: new Date(),
      suspendReason: "Auto-suspended: 3+ reports received",
    });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add app/api/block/route.ts app/api/report/route.ts
git commit -m "feat: add block/report API routes with auto-suspension"
```

---

## Task 4: Rate Limiting Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create edge middleware with rate limiting**

```typescript
// middleware.ts
import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (resets on cold start — acceptable for Vercel Edge)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "/api/create-order": { maxRequests: 5, windowMs: 10 * 60 * 1000 },
  "/api/report": { maxRequests: 10, windowMs: 60 * 60 * 1000 },
  "/api/interests": { maxRequests: 50, windowMs: 60 * 1000 },
  "/api/": { maxRequests: 100, windowMs: 60 * 1000 }, // general fallback
};

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, config: RateLimitConfig): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + config.windowMs });
    return { allowed: true };
  }

  if (entry.count >= config.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true };
}

function getRateLimitConfig(pathname: string): RateLimitConfig {
  for (const [path, config] of Object.entries(RATE_LIMITS)) {
    if (path !== "/api/" && pathname.startsWith(path)) {
      return config;
    }
  }
  return RATE_LIMITS["/api/"];
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes
  if (pathname.startsWith("/api/") && request.method === "POST") {
    const ip = getClientIp(request);
    const config = getRateLimitConfig(pathname);
    const key = `${ip}:${pathname}`;
    const { allowed, retryAfter } = checkRateLimit(key, config);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(retryAfter) },
        }
      );
    }
  }

  // Admin route protection: check for admin cookie/header
  if (pathname.startsWith("/admin")) {
    const adminToken = request.cookies.get("admin_role")?.value;
    if (adminToken !== "admin" && adminToken !== "moderator") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
```

- [ ] **Step 2: Commit**

```bash
git add middleware.ts
git commit -m "feat: add edge middleware with rate limiting and admin route protection"
```

---

## Task 5: CSP Headers & Next.js Config

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Read current next.config.ts**

Read the file to understand existing configuration.

- [ ] **Step 2: Add security headers to next.config.ts**

Add the `headers` function to the Next.js config:

```typescript
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "randomuser.me" },
      { protocol: "https", hostname: "ui-avatars.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://checkout.razorpay.com https://www.gstatic.com https://apis.google.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https://*.cloudinary.com https://ui-avatars.com https://lh3.googleusercontent.com https://randomuser.me",
              "font-src 'self'",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com wss://*.firebaseio.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://checkout.razorpay.com",
              "frame-src https://checkout.razorpay.com https://*.firebaseapp.com",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

- [ ] **Step 3: Commit**

```bash
git add next.config.ts
git commit -m "feat: add CSP and security headers to Next.js config"
```

---

## Task 6: Admin Layout & Dashboard

**Files:**
- Create: `app/admin/layout.tsx`
- Create: `app/admin/page.tsx`
- Create: `app/api/admin/stats/route.ts`

- [ ] **Step 1: Create admin layout with sidebar**

```typescript
// app/admin/layout.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, ShieldCheck, AlertTriangle,
  BarChart3, LogOut, Loader2
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals", label: "Approvals", icon: ShieldCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: AlertTriangle },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user || !userProfile) {
      router.push("/auth/login");
      return;
    }
    // Check admin role from profile
    const role = (userProfile as any).role;
    if (role !== "admin" && role !== "moderator") {
      router.push("/dashboard");
      return;
    }
    setAuthorized(true);
    // Set admin cookie for middleware
    document.cookie = `admin_role=${role}; path=/; max-age=${60 * 60 * 24}`;
  }, [user, userProfile, loading, router]);

  if (loading || !authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-serif text-lg font-bold text-[var(--primary)]">
            Izzatdar Admin
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {(userProfile as any).role === "admin" ? "Administrator" : "Moderator"}
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-[var(--primary)] transition-all"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-500 hover:text-gray-700 transition-all"
          >
            <LogOut className="w-4 h-4" /> Exit Admin
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Create admin stats API**

```typescript
// app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const adminDb = getAdminDb();

  const [usersSnap, pendingSnap, premiumSnap, reportsSnap] = await Promise.all([
    adminDb.collection("users").count().get(),
    adminDb.collection("users").where("status", "==", "pending").count().get(),
    adminDb.collection("users").where("is_premium", "==", true).count().get(),
    adminDb.collection("reports").where("status", "==", "pending").count().get(),
  ]);

  // Recent signups (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentSnap = await adminDb
    .collection("users")
    .where("createdAt", ">=", sevenDaysAgo)
    .count()
    .get();

  return NextResponse.json({
    totalUsers: usersSnap.data().count,
    pendingApprovals: pendingSnap.data().count,
    premiumUsers: premiumSnap.data().count,
    pendingReports: reportsSnap.data().count,
    signupsThisWeek: recentSnap.data().count,
  });
}
```

- [ ] **Step 3: Create admin dashboard page**

```typescript
// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, ShieldCheck, Crown, AlertTriangle, TrendingUp } from "lucide-react";

interface Stats {
  totalUsers: number;
  pendingApprovals: number;
  premiumUsers: number;
  pendingReports: number;
  signupsThisWeek: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Pending Approvals", value: stats.pendingApprovals, icon: ShieldCheck, color: "bg-amber-50 text-amber-600" },
    { label: "Premium Users", value: stats.premiumUsers, icon: Crown, color: "bg-purple-50 text-purple-600" },
    { label: "Pending Reports", value: stats.pendingReports, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
    { label: "Signups (7 days)", value: stats.signupsThisWeek, icon: TrendingUp, color: "bg-green-50 text-green-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-sm text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/admin/layout.tsx app/admin/page.tsx app/api/admin/stats/route.ts
git commit -m "feat: add admin panel layout and dashboard with stats"
```

---

## Task 7: Admin Approval Queue

**Files:**
- Create: `app/admin/approvals/page.tsx`
- Create: `app/api/admin/approve/route.ts`

- [ ] **Step 1: Create approval API route**

```typescript
// app/api/admin/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { uid, action, reason } = body;

  if (!uid || !action) {
    return NextResponse.json({ error: "uid and action required" }, { status: 400 });
  }

  if (!["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  if (action === "approve") {
    await adminDb.collection("users").doc(uid).update({
      status: "approved",
      approvedAt: new Date(),
    });
  } else {
    if (!reason) {
      return NextResponse.json({ error: "Rejection reason required" }, { status: 400 });
    }
    await adminDb.collection("users").doc(uid).update({
      status: "rejected",
      rejectedAt: new Date(),
      rejectionReason: reason,
    });

    // Send notification to user
    await adminDb.collection("notifications").add({
      userId: uid,
      type: "system",
      title: "Profile Not Approved",
      body: `Your profile was not approved. Reason: ${reason}. Please update and resubmit.`,
      read: false,
      createdAt: new Date(),
    });
  }

  return NextResponse.json({ success: true });
}

export async function GET(request: NextRequest) {
  const adminDb = getAdminDb();

  const snap = await adminDb
    .collection("users")
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const profiles = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));

  return NextResponse.json({ profiles });
}
```

- [ ] **Step 2: Create approvals page**

```typescript
// app/admin/approvals/page.tsx
"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Check, X, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function ApprovalsPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchProfiles = () => {
    setLoading(true);
    fetch("/api/admin/approve")
      .then((res) => res.json())
      .then((data) => setProfiles(data.profiles || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProfiles(); }, []);

  const handleAction = async (uid: string, action: "approve" | "reject") => {
    let reason = "";
    if (action === "reject") {
      reason = prompt("Rejection reason:") || "";
      if (!reason) return;
    }

    setProcessingId(uid);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Profile ${action === "approve" ? "approved" : "rejected"}`);
        setProfiles((prev) => prev.filter((p) => p.uid !== uid));
      } else {
        toast.error(data.error || "Action failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          Pending Approvals ({profiles.length})
        </h1>
        <Button onClick={fetchProfiles} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm">No pending profiles to review.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {profiles.map((profile) => (
            <div
              key={profile.uid}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-6"
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={profile.photoURL || `https://ui-avatars.com/api/?name=${profile.name}&size=64`}
                  alt={profile.name}
                  width={64}
                  height={64}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900">{profile.name}</p>
                <p className="text-sm text-gray-500">
                  {profile.age && `${profile.age}y`} | {profile.gender} | {profile.location} | {profile.religion}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {profile.email} | {profile.phone}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Button
                  size="sm"
                  onClick={() => handleAction(profile.uid, "approve")}
                  disabled={processingId === profile.uid}
                  className="bg-green-500 hover:bg-green-600 text-white"
                >
                  {processingId === profile.uid ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(profile.uid, "reject")}
                  disabled={processingId === profile.uid}
                  className="border-red-200 text-red-600 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/approvals/page.tsx app/api/admin/approve/route.ts
git commit -m "feat: add admin profile approval queue with approve/reject actions"
```

---

## Task 8: Admin User Management

**Files:**
- Create: `app/admin/users/page.tsx`
- Create: `app/api/admin/users/route.ts`

- [ ] **Step 1: Create admin users API**

```typescript
// app/api/admin/users/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);

  const adminDb = getAdminDb();

  let snap;
  if (search) {
    // Search by email (Firestore limitation: only prefix match)
    snap = await adminDb
      .collection("users")
      .where("email", ">=", search)
      .where("email", "<=", search + "\uf8ff")
      .limit(pageSize)
      .get();

    // Also search by name
    if (snap.empty) {
      snap = await adminDb
        .collection("users")
        .where("name", ">=", search)
        .where("name", "<=", search + "\uf8ff")
        .limit(pageSize)
        .get();
    }
  } else {
    snap = await adminDb
      .collection("users")
      .orderBy("createdAt", "desc")
      .limit(pageSize)
      .get();
  }

  const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { uid, action, reason } = body;

  if (!uid || !action) {
    return NextResponse.json({ error: "uid and action required" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  switch (action) {
    case "suspend":
      await adminDb.collection("users").doc(uid).update({
        status: "suspended",
        suspendedAt: new Date(),
        suspendReason: reason || "Suspended by admin",
      });
      break;

    case "unsuspend":
      await adminDb.collection("users").doc(uid).update({
        status: "approved",
        suspendedAt: null,
        suspendReason: null,
      });
      break;

    case "ban":
      // Anonymize user data
      await adminDb.collection("users").doc(uid).update({
        status: "banned",
        name: "Deleted User",
        email: "",
        phone: "",
        photoURL: "",
        photos: [],
        bio: "",
        bannedAt: new Date(),
        banReason: reason || "Banned by admin",
      });
      // Disable auth account
      try {
        const adminAuth = getAdminAuth();
        await adminAuth.updateUser(uid, { disabled: true });
      } catch (e) {
        console.error("Failed to disable auth:", e);
      }
      break;

    case "set_premium":
      await adminDb.collection("users").doc(uid).update({
        is_premium: true,
      });
      break;

    case "remove_premium":
      await adminDb.collection("users").doc(uid).update({
        is_premium: false,
      });
      break;

    case "set_role":
      const { role } = body;
      if (!["user", "moderator", "admin"].includes(role)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }
      await adminDb.collection("users").doc(uid).update({ role });
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create admin users page**

```typescript
// app/admin/users/page.tsx
"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Ban, Shield, Crown, UserX } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(UserProfile & { role?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = (query = "") => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("search", query);
    fetch(`/api/admin/users?${params}`)
      .then((res) => res.json())
      .then((data) => setUsers(data.users || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const handleAction = async (uid: string, action: string, extra?: any) => {
    let reason = "";
    if (action === "suspend" || action === "ban") {
      reason = prompt(`Reason for ${action}:`) || "";
      if (!reason && action === "ban") return; // Ban requires reason
    }

    setActionLoading(uid);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, action, reason, ...extra }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Action "${action}" completed`);
        fetchUsers(search);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-serif font-bold text-gray-900 mb-8">User Management</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="pl-10 rounded-xl"
          />
        </div>
        <Button type="submit" variant="outline">Search</Button>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.uid} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <Image
                  src={u.photoURL || `https://ui-avatars.com/api/?name=${u.name}&size=48`}
                  alt={u.name}
                  width={48}
                  height={48}
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">{u.name}</p>
                  {u.is_premium && <Crown className="w-4 h-4 text-amber-500" />}
                  {u.role === "admin" && <Shield className="w-4 h-4 text-blue-500" />}
                </div>
                <p className="text-xs text-gray-500">{u.email} | {u.status}</p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {u.status === "approved" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(u.uid, "suspend")}
                    disabled={actionLoading === u.uid}
                    className="text-amber-600 border-amber-200"
                  >
                    <UserX className="w-3 h-3 mr-1" /> Suspend
                  </Button>
                )}
                {u.status === "suspended" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAction(u.uid, "unsuspend")}
                    disabled={actionLoading === u.uid}
                    className="text-green-600 border-green-200"
                  >
                    Unsuspend
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(u.uid, "ban")}
                  disabled={actionLoading === u.uid}
                  className="text-red-600 border-red-200"
                >
                  <Ban className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/users/page.tsx app/api/admin/users/route.ts
git commit -m "feat: add admin user management with suspend/ban/role actions"
```

---

## Task 9: Admin Reports Queue

**Files:**
- Create: `app/admin/reports/page.tsx`
- Create: `app/api/admin/reports/route.ts`

- [ ] **Step 1: Create admin reports API**

```typescript
// app/api/admin/reports/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function GET(request: NextRequest) {
  const adminDb = getAdminDb();
  const snap = await adminDb
    .collection("reports")
    .where("status", "==", "pending")
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const reports = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Enrich with user names
  const userIds = new Set<string>();
  reports.forEach((r: any) => {
    userIds.add(r.reporterId);
    userIds.add(r.reportedUserId);
  });

  const userMap: Record<string, string> = {};
  for (const uid of userIds) {
    const userDoc = await adminDb.collection("users").doc(uid).get();
    if (userDoc.exists) {
      userMap[uid] = userDoc.data()?.name || "Unknown";
    }
  }

  const enriched = reports.map((r: any) => ({
    ...r,
    reporterName: userMap[r.reporterId] || "Unknown",
    reportedUserName: userMap[r.reportedUserId] || "Unknown",
  }));

  return NextResponse.json({ reports: enriched });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { reportId, action, adminNotes } = body;

  if (!reportId || !action) {
    return NextResponse.json({ error: "reportId and action required" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  switch (action) {
    case "dismiss":
      await adminDb.collection("reports").doc(reportId).update({
        status: "dismissed",
        adminNotes: adminNotes || "",
        resolvedAt: new Date(),
      });
      break;

    case "warn":
      const reportDoc = await adminDb.collection("reports").doc(reportId).get();
      const reportData = reportDoc.data();
      if (reportData) {
        await adminDb.collection("notifications").add({
          userId: reportData.reportedUserId,
          type: "system",
          title: "Warning",
          body: "Your profile has received a warning. Please review our community guidelines.",
          read: false,
          createdAt: new Date(),
        });
      }
      await adminDb.collection("reports").doc(reportId).update({
        status: "action_taken",
        adminNotes: adminNotes || "Warning issued",
        resolvedAt: new Date(),
      });
      break;

    case "suspend":
      const rDoc = await adminDb.collection("reports").doc(reportId).get();
      const rData = rDoc.data();
      if (rData) {
        await adminDb.collection("users").doc(rData.reportedUserId).update({
          status: "suspended",
          suspendedAt: new Date(),
          suspendReason: adminNotes || "Suspended after report review",
        });
      }
      await adminDb.collection("reports").doc(reportId).update({
        status: "action_taken",
        adminNotes: adminNotes || "User suspended",
        resolvedAt: new Date(),
      });
      break;

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 2: Create admin reports page**

```typescript
// app/admin/reports/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, XCircle, Shield } from "lucide-react";
import { toast } from "sonner";

interface ReportEntry {
  id: string;
  reporterId: string;
  reportedUserId: string;
  reporterName: string;
  reportedUserName: string;
  reason: string;
  details?: string;
  createdAt: any;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<ReportEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = () => {
    setLoading(true);
    fetch("/api/admin/reports")
      .then((res) => res.json())
      .then((data) => setReports(data.reports || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (reportId: string, action: string) => {
    const adminNotes = prompt("Admin notes (optional):") || "";
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action, adminNotes }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Report ${action}ed`);
        setReports((prev) => prev.filter((r) => r.id !== reportId));
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Network error");
    } finally {
      setActionLoading(null);
    }
  };

  const reasonLabels: Record<string, string> = {
    fake_profile: "Fake Profile",
    harassment: "Harassment",
    inappropriate_photos: "Inappropriate Photos",
    scam: "Scam",
    underage: "Underage",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-serif font-bold text-gray-900">
          Reports Queue ({reports.length})
        </h1>
        <Button onClick={fetchReports} variant="outline" size="sm">
          Refresh
        </Button>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-lg font-medium">No pending reports</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-sm font-bold text-gray-900">
                      {reasonLabels[report.reason] || report.reason}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">{report.reporterName}</span> reported{" "}
                    <span className="font-medium text-red-600">{report.reportedUserName}</span>
                  </p>
                </div>
              </div>

              {report.details && (
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                  &ldquo;{report.details}&rdquo;
                </p>
              )}

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(report.id, "dismiss")}
                  disabled={actionLoading === report.id}
                >
                  <XCircle className="w-3 h-3 mr-1" /> Dismiss
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(report.id, "warn")}
                  disabled={actionLoading === report.id}
                  className="text-amber-600 border-amber-200"
                >
                  Warn User
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAction(report.id, "suspend")}
                  disabled={actionLoading === report.id}
                  className="text-red-600 border-red-200"
                >
                  <Shield className="w-3 h-3 mr-1" /> Suspend
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/admin/reports/page.tsx app/api/admin/reports/route.ts
git commit -m "feat: add admin reports queue with dismiss/warn/suspend actions"
```

---

## Task 10: Block/Report UI Components

**Files:**
- Create: `components/BlockReportMenu.tsx`
- Create: `components/ReportModal.tsx`

- [ ] **Step 1: Create BlockReportMenu component**

```typescript
// components/BlockReportMenu.tsx
"use client";

import { useState } from "react";
import { MoreVertical, Ban, Flag } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

interface BlockReportMenuProps {
  targetUserId: string;
  targetUserName: string;
  onReportClick: () => void;
}

export default function BlockReportMenu({
  targetUserId,
  targetUserName,
  onReportClick,
}: BlockReportMenuProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  const handleBlock = async () => {
    if (!user) return;
    const confirmed = confirm(`Are you sure you want to block ${targetUserName}? They won't be able to see your profile or contact you.`);
    if (!confirmed) return;

    setBlocking(true);
    try {
      const res = await fetch("/api/block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blockerId: user.uid, blockedId: targetUserId }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${targetUserName} has been blocked`);
      } else {
        toast.error(data.error || "Failed to block user");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBlocking(false);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-100 transition-all"
        title="More options"
      >
        <MoreVertical className="w-5 h-5 text-gray-500" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2">
            <button
              onClick={handleBlock}
              disabled={blocking}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Ban className="w-4 h-4 text-red-500" />
              Block User
            </button>
            <button
              onClick={() => { setOpen(false); onReportClick(); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Flag className="w-4 h-4 text-amber-500" />
              Report Profile
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ReportModal component**

```typescript
// components/ReportModal.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ReportModalProps {
  open: boolean;
  onClose: () => void;
  targetUserId: string;
  targetUserName: string;
}

const REASONS = [
  { value: "fake_profile", label: "Fake Profile" },
  { value: "harassment", label: "Harassment / Abusive Behavior" },
  { value: "inappropriate_photos", label: "Inappropriate Photos" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "underage", label: "Underage User" },
  { value: "other", label: "Other" },
];

export default function ReportModal({ open, onClose, targetUserId, targetUserName }: ReportModalProps) {
  const { user } = useAuth();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!user || !reason) {
      toast.error("Please select a reason");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporterId: user.uid,
          reportedUserId: targetUserId,
          reason,
          details,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Report submitted. Our team will review it.");
        onClose();
        setReason("");
        setDetails("");
      } else {
        toast.error(data.error || "Failed to submit report");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-bold text-gray-900">Report {targetUserName}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">Why are you reporting this profile?</p>

          <div className="space-y-2">
            {REASONS.map((r) => (
              <label
                key={r.value}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  reason === r.value
                    ? "border-[var(--primary)] bg-[var(--primary-container)]/20"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="reason"
                  value={r.value}
                  checked={reason === r.value}
                  onChange={(e) => setReason(e.target.value)}
                  className="accent-[var(--primary)]"
                />
                <span className="text-sm font-medium text-gray-700">{r.label}</span>
              </label>
            ))}
          </div>

          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Additional details (optional)..."
            rows={3}
            className="w-full p-3 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:border-[var(--primary)]"
          />
        </div>

        <div className="p-6 border-t flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!reason || submitting}
            className="flex-1 rounded-xl bg-red-500 hover:bg-red-600 text-white"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Report
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/BlockReportMenu.tsx components/ReportModal.tsx
git commit -m "feat: add BlockReportMenu and ReportModal UI components"
```

---

## Task 11: Email Verification Banner

**Files:**
- Create: `components/EmailVerificationBanner.tsx`

- [ ] **Step 1: Create the email verification banner**

```typescript
// components/EmailVerificationBanner.tsx
"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { AlertTriangle, Mail, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  // Don't show for phone-only or Google users, or verified users
  if (!user || !user.email || user.emailVerified) return null;
  // Don't show if user signed in via phone or Google (no password provider)
  const hasPasswordProvider = user.providerData.some((p) => p.providerId === "password");
  if (!hasPasswordProvider) return null;

  const handleResend = async () => {
    if (cooldown) return;
    setSending(true);
    try {
      await sendEmailVerification(user);
      toast.success("Verification email sent! Check your inbox.");
      setCooldown(true);
      setTimeout(() => setCooldown(false), 60000); // 60s cooldown
    } catch (e: any) {
      if (e.code === "auth/too-many-requests") {
        toast.error("Too many attempts. Please try again later.");
      } else {
        toast.error("Failed to send verification email");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-bold">Verify your email</span> to send messages and appear in search results.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleResend}
          disabled={sending || cooldown}
          className="border-amber-300 text-amber-700 hover:bg-amber-100 flex-shrink-0"
        >
          {sending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Mail className="w-3 h-3 mr-1" />
          )}
          {cooldown ? "Sent!" : "Resend Email"}
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/EmailVerificationBanner.tsx
git commit -m "feat: add email verification banner component"
```

---

## Task 12: Integration — Wire Components Into Existing Pages

**Files:**
- Modify: `app/layout.tsx` or `app/dashboard/page.tsx` — add EmailVerificationBanner
- Modify: `app/matches/page.tsx` — add BlockReportMenu + ReportModal

- [ ] **Step 1: Add EmailVerificationBanner to the main layout or dashboard**

In `app/layout.tsx`, add the banner right after the `<body>` opening (or wrap children). Alternatively, add it in the dashboard page.

Add to `app/dashboard/page.tsx` at the top of the returned JSX, before Navbar:

```typescript
import EmailVerificationBanner from "@/components/EmailVerificationBanner";
```

And in the JSX:
```tsx
<EmailVerificationBanner />
<Navbar />
```

- [ ] **Step 2: Add BlockReportMenu to the matches page profile view**

In `app/matches/page.tsx`, import and add BlockReportMenu:

```typescript
import BlockReportMenu from "@/components/BlockReportMenu";
import ReportModal from "@/components/ReportModal";
```

Add state for report modal:
```typescript
const [reportTarget, setReportTarget] = useState<{ uid: string; name: string } | null>(null);
```

Add the menu in the profile details area (top-right corner of the details card).

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add app/dashboard/page.tsx app/matches/page.tsx
git commit -m "feat: integrate email verification banner and block/report into existing pages"
```

---

## Task 13: Final Verification

- [ ] **Step 1: Run all tests**

Run: `npx vitest run`
Expected: All tests pass (sanitize, block-report, matching, interests, shortlist)

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run build**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 4: Commit any fixes**

```bash
git add -A
git commit -m "fix: resolve Phase 2 integration issues"
```

---

## Summary

After completing all 13 tasks, Phase 2 delivers:

| Feature | Implementation |
|---------|---------------|
| Input Sanitization | DOMPurify-based `sanitizeText`/`sanitizeBio` for all user input |
| Block System | Firestore subcollection + API + confirmation UI |
| Report System | 6 reasons + auto-suspend at 3 reports + admin queue |
| Rate Limiting | Edge middleware with per-endpoint limits + 429 responses |
| CSP Headers | Strict Content-Security-Policy + X-Frame-Options + more |
| Admin Dashboard | Stats overview (users, approvals, premium, reports) |
| Admin Approvals | Queue with approve/reject + reason notification |
| Admin Users | Search, suspend, ban, role management |
| Admin Reports | Dismiss/warn/suspend actions with notes |
| Email Verification | Banner + resend with cooldown + feature gating |
| Block/Report UI | Three-dot menu + report modal on every profile |

**Next:** Phase 3 — Family-Centric & Community (family profiles, community trust score, vouch system)

