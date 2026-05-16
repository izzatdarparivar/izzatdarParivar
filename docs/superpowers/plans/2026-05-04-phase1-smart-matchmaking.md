# Phase 1: Smart Matchmaking Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the naive "load all profiles" browsing with a weighted compatibility scoring algorithm, cursor-based pagination, interest tracking, shortlist/favorites, and daily recommendations.

**Architecture:** Pure function scoring engine in `lib/matching.ts` consumed by a new API route `/api/matches` that returns paginated, scored profiles. Interest and shortlist data stored in Firestore subcollections. Daily recommendations generated on-demand via API (Cloud Functions added later).

**Tech Stack:** Next.js 16 App Router, TypeScript, Firebase Firestore (client SDK for real-time, Admin SDK for server mutations), Vitest for unit tests.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `lib/matching.ts` | Pure compatibility scoring function + helpers |
| `lib/matching.test.ts` | Unit tests for scoring algorithm |
| `lib/interests.ts` | Interest CRUD (send, accept, decline, query) |
| `lib/interests.test.ts` | Unit tests for interest logic |
| `lib/shortlist.ts` | Shortlist add/remove/query |
| `lib/shortlist.test.ts` | Unit tests for shortlist logic |
| `lib/firestore.ts` | Modified — add pagination, `getProfilesPaginated()` |
| `app/api/matches/route.ts` | Server endpoint: paginated + scored profiles |
| `app/api/interests/route.ts` | Server endpoint: send/accept/decline interest |
| `app/api/shortlist/route.ts` | Server endpoint: add/remove shortlist |
| `app/api/recommendations/route.ts` | Server endpoint: daily top-10 recommendations |
| `app/matches/page.tsx` | Modified — tabs (For You / Browse), pagination, score badge |
| `components/CompatibilityBadge.tsx` | Score display component with color coding |
| `components/ShortlistButton.tsx` | Heart/bookmark toggle on profile cards |
| `components/InterestButton.tsx` | "Interested" button with mutual match detection |
| `vitest.config.ts` | Test runner configuration |

---

## Task 1: Set Up Vitest Testing Framework

**Files:**
- Create: `vitest.config.ts`
- Create: `lib/matching.test.ts` (placeholder)
- Modify: `package.json` (add vitest scripts + deps)

- [ ] **Step 1: Install Vitest**

Run:
```bash
npm install -D vitest @types/node
```

- [ ] **Step 2: Create vitest.config.ts**

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

- [ ] **Step 3: Add test script to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Create placeholder test to verify setup**

```typescript
// lib/matching.test.ts
import { describe, it, expect } from "vitest";

describe("matching", () => {
  it("placeholder - framework works", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run test to verify setup**

Run: `npx vitest run`
Expected: 1 test passes

- [ ] **Step 6: Commit**

```bash
git add vitest.config.ts lib/matching.test.ts package.json package-lock.json
git commit -m "chore: add vitest testing framework"
```

---

## Task 2: Compatibility Scoring Algorithm — Core Function

**Files:**
- Create: `lib/matching.ts`
- Modify: `lib/matching.test.ts`

- [ ] **Step 1: Write failing tests for calculateCompatibility**

```typescript
// lib/matching.test.ts
import { describe, it, expect } from "vitest";
import { calculateCompatibility, CompatibilityResult } from "./matching";
import { UserProfile } from "./firestore";
import { Timestamp } from "firebase/firestore";

// Helper to create a minimal profile for testing
function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    uid: "test-uid",
    name: "Test User",
    gender: "male",
    dob: null,
    age: 28,
    height: "5'8\"",
    location: "Mumbai",
    religion: "Hindu",
    caste: "Brahmin",
    motherTongue: "Hindi",
    education: "Bachelor's",
    occupation: "Engineer",
    annualIncome: "5-10 LPA",
    bio: "Hello",
    photoURL: "",
    phone: "",
    email: "test@test.com",
    preferences: { minAge: 24, maxAge: 32, religion: "Hindu", location: "Mumbai" },
    status: "approved",
    is_premium: false,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  };
}

describe("calculateCompatibility", () => {
  it("returns 100 for a perfect match", () => {
    const seeker = makeProfile({
      uid: "seeker",
      gender: "male",
      age: 28,
      location: "Mumbai",
      religion: "Hindu",
      caste: "Brahmin",
      motherTongue: "Hindi",
      education: "Bachelor's",
      annualIncome: "5-10 LPA",
      diet: "Vegetarian",
      lifestyle: "Moderate",
      familyType: "Nuclear",
      hobbies: ["reading", "cooking", "travel"],
      gotra: "Bharadwaj",
      preferences: { minAge: 24, maxAge: 32, religion: "Hindu", location: "Mumbai" },
    });

    const candidate = makeProfile({
      uid: "candidate",
      gender: "female",
      age: 26,
      location: "Mumbai",
      religion: "Hindu",
      caste: "Brahmin",
      motherTongue: "Hindi",
      education: "Bachelor's",
      annualIncome: "5-10 LPA",
      diet: "Vegetarian",
      lifestyle: "Moderate",
      familyType: "Nuclear",
      hobbies: ["reading", "cooking", "travel"],
      gotra: "Kashyap",
      preferences: { minAge: 26, maxAge: 34, religion: "Hindu", location: "Mumbai" },
    });

    const result = calculateCompatibility(seeker, candidate);
    expect(result.score).toBe(100);
    expect(result.breakdown).toBeDefined();
  });

  it("returns 0 for same gotra (cultural incompatibility)", () => {
    const seeker = makeProfile({
      uid: "seeker",
      gotra: "Bharadwaj",
      preferences: { minAge: 24, maxAge: 32, religion: "Hindu", location: "Mumbai" },
    });
    const candidate = makeProfile({
      uid: "candidate",
      gotra: "Bharadwaj",
      preferences: { minAge: 24, maxAge: 32, religion: "Hindu", location: "Mumbai" },
    });

    const result = calculateCompatibility(seeker, candidate);
    // Caste/Gotra dimension should be 0 (same gotra is incompatible)
    expect(result.breakdown.casteGotra).toBe(0);
  });

  it("penalizes age outside preference range", () => {
    const seeker = makeProfile({
      uid: "seeker",
      age: 30,
      preferences: { minAge: 24, maxAge: 28, religion: "Any", location: "Any" },
    });
    const candidate = makeProfile({
      uid: "candidate",
      age: 35, // outside seeker's max of 28
      preferences: { minAge: 26, maxAge: 34, religion: "Any", location: "Any" },
    });

    const result = calculateCompatibility(seeker, candidate);
    // 7 years outside range = 70% penalty on the age dimension
    expect(result.breakdown.age).toBeLessThan(50);
  });

  it("gives full score for religion when preference is Any", () => {
    const seeker = makeProfile({
      uid: "seeker",
      religion: "Hindu",
      preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Any" },
    });
    const candidate = makeProfile({
      uid: "candidate",
      religion: "Muslim",
      preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Any" },
    });

    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.religion).toBe(100);
  });

  it("gives 0 for religion mismatch when specific preference set", () => {
    const seeker = makeProfile({
      uid: "seeker",
      religion: "Hindu",
      preferences: { minAge: 20, maxAge: 40, religion: "Hindu", location: "Any" },
    });
    const candidate = makeProfile({
      uid: "candidate",
      religion: "Muslim",
      preferences: { minAge: 20, maxAge: 40, religion: "Muslim", location: "Any" },
    });

    const result = calculateCompatibility(seeker, candidate);
    expect(result.breakdown.religion).toBe(0);
  });

  it("calculates hobby overlap correctly", () => {
    const seeker = makeProfile({
      uid: "seeker",
      hobbies: ["reading", "cooking", "travel", "music"],
      preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Any" },
    });
    const candidate = makeProfile({
      uid: "candidate",
      hobbies: ["reading", "cooking", "gym"],
      preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Any" },
    });

    const result = calculateCompatibility(seeker, candidate);
    // 2 common out of max(4, 3) = 4 → 50%
    expect(result.breakdown.hobbies).toBe(50);
  });

  it("gives partial location score for same state different city", () => {
    const seeker = makeProfile({
      uid: "seeker",
      location: "Pune, Maharashtra",
      preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Maharashtra" },
    });
    const candidate = makeProfile({
      uid: "candidate",
      location: "Mumbai, Maharashtra",
      preferences: { minAge: 20, maxAge: 40, religion: "Any", location: "Maharashtra" },
    });

    const result = calculateCompatibility(seeker, candidate);
    // Same state but different city → 75
    expect(result.breakdown.location).toBe(75);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/matching.test.ts`
Expected: FAIL — cannot find module `./matching`

- [ ] **Step 3: Implement calculateCompatibility**

```typescript
// lib/matching.ts
import { UserProfile } from "./firestore";

/** Weights for each scoring dimension (must sum to 100) */
export const SCORING_WEIGHTS = {
  age: 20,
  religion: 15,
  casteGotra: 10,
  location: 15,
  education: 10,
  income: 5,
  diet: 5,
  lifestyle: 5,
  familyType: 5,
  hobbies: 5,
  motherTongue: 5,
} as const;

export interface ScoreBreakdown {
  age: number;
  religion: number;
  casteGotra: number;
  location: number;
  education: number;
  income: number;
  diet: number;
  lifestyle: number;
  familyType: number;
  hobbies: number;
  motherTongue: number;
}

export interface CompatibilityResult {
  score: number; // 0-100
  breakdown: ScoreBreakdown;
}

/** Education levels mapped to ordinal values */
const EDUCATION_LEVELS: Record<string, number> = {
  "high school": 1,
  "bachelor's": 2,
  "bachelors": 2,
  "master's": 3,
  "masters": 3,
  "phd": 4,
  "professional": 5,
};

/** Income brackets mapped to ordinal values */
const INCOME_BRACKETS: Record<string, number> = {
  "0-3 lpa": 1,
  "3-5 lpa": 2,
  "5-10 lpa": 3,
  "10-20 lpa": 4,
  "20-50 lpa": 5,
  "50+ lpa": 6,
};

/** Lifestyle adjacency: Traditional=1, Moderate=2, Liberal=3 */
const LIFESTYLE_LEVELS: Record<string, number> = {
  traditional: 1,
  moderate: 2,
  liberal: 3,
};

/** Diet compatibility matrix */
const DIET_COMPAT: Record<string, Record<string, number>> = {
  vegetarian: { vegetarian: 100, eggetarian: 50, vegan: 75, "non-vegetarian": 0 },
  eggetarian: { vegetarian: 50, eggetarian: 100, vegan: 50, "non-vegetarian": 50 },
  vegan: { vegetarian: 75, eggetarian: 50, vegan: 100, "non-vegetarian": 0 },
  "non-vegetarian": { vegetarian: 0, eggetarian: 50, vegan: 0, "non-vegetarian": 100 },
};

/** Hindi language family grouping for mother tongue scoring */
const LANGUAGE_FAMILIES: Record<string, string> = {
  hindi: "indo-aryan",
  marathi: "indo-aryan",
  gujarati: "indo-aryan",
  punjabi: "indo-aryan",
  bengali: "indo-aryan",
  odia: "indo-aryan",
  tamil: "dravidian",
  telugu: "dravidian",
  kannada: "dravidian",
  malayalam: "dravidian",
};

function scoreAge(seeker: UserProfile, candidate: UserProfile): number {
  const candidateAge = candidate.age || 25;
  const minAge = seeker.preferences?.minAge || 18;
  const maxAge = seeker.preferences?.maxAge || 60;

  if (candidateAge >= minAge && candidateAge <= maxAge) return 100;

  const distance = candidateAge < minAge
    ? minAge - candidateAge
    : candidateAge - maxAge;

  // 10% penalty per year outside range, min 0
  return Math.max(0, 100 - distance * 10);
}

function scoreReligion(seeker: UserProfile, candidate: UserProfile): number {
  const pref = seeker.preferences?.religion?.toLowerCase() || "any";
  if (pref === "any" || pref === "") return 100;

  const candidateReligion = candidate.religion?.toLowerCase() || "";
  return pref === candidateReligion ? 100 : 0;
}

function scoreCasteGotra(seeker: UserProfile, candidate: UserProfile): number {
  // Same gotra = incompatible (0 score)
  if (
    seeker.gotra &&
    candidate.gotra &&
    seeker.gotra.toLowerCase() === candidate.gotra.toLowerCase()
  ) {
    return 0;
  }

  // Same caste + different gotra = perfect
  const seekerCaste = seeker.caste?.toLowerCase() || "";
  const candidateCaste = candidate.caste?.toLowerCase() || "";

  if (!seekerCaste || !candidateCaste) return 50; // Unknown → neutral
  if (seekerCaste === candidateCaste) return 100;
  return 50; // Different caste → neutral (user may have "Any" preference)
}

function scoreLocation(seeker: UserProfile, candidate: UserProfile): number {
  const seekerLoc = seeker.location?.toLowerCase() || "";
  const candidateLoc = candidate.location?.toLowerCase() || "";

  if (!seekerLoc || !candidateLoc) return 50;

  // Exact match (same city)
  if (seekerLoc === candidateLoc) return 100;

  // Check if they share a state (comma-separated "City, State" format)
  const seekerParts = seekerLoc.split(",").map((s) => s.trim());
  const candidateParts = candidateLoc.split(",").map((s) => s.trim());

  // Same state
  if (seekerParts.length > 1 && candidateParts.length > 1) {
    if (seekerParts[1] === candidateParts[1]) return 75;
  }

  // Check if one location contains the other's state
  const seekerPref = seeker.preferences?.location?.toLowerCase() || "any";
  if (seekerPref === "any" || seekerPref === "") return 50;

  if (candidateLoc.includes(seekerPref) || seekerPref.includes(candidateLoc)) {
    return 75;
  }

  return 25;
}

function scoreEducation(seeker: UserProfile, candidate: UserProfile): number {
  const seekerLevel = EDUCATION_LEVELS[seeker.education?.toLowerCase() || ""] || 0;
  const candidateLevel = EDUCATION_LEVELS[candidate.education?.toLowerCase() || ""] || 0;

  if (seekerLevel === 0 || candidateLevel === 0) return 50; // Unknown → neutral

  const gap = Math.abs(seekerLevel - candidateLevel);
  if (gap === 0) return 100;
  if (gap === 1) return 75;
  if (gap === 2) return 50;
  return 25;
}

function scoreIncome(seeker: UserProfile, candidate: UserProfile): number {
  const seekerBracket = INCOME_BRACKETS[seeker.annualIncome?.toLowerCase() || ""] || 0;
  const candidateBracket = INCOME_BRACKETS[candidate.annualIncome?.toLowerCase() || ""] || 0;

  if (seekerBracket === 0 || candidateBracket === 0) return 50;

  const gap = Math.abs(seekerBracket - candidateBracket);
  if (gap === 0) return 100;
  if (gap === 1) return 75;
  if (gap === 2) return 50;
  return 25;
}

function scoreDiet(seeker: UserProfile, candidate: UserProfile): number {
  const seekerDiet = seeker.diet?.toLowerCase() || "";
  const candidateDiet = candidate.diet?.toLowerCase() || "";

  if (!seekerDiet || !candidateDiet) return 50;

  return DIET_COMPAT[seekerDiet]?.[candidateDiet] ?? 50;
}

function scoreLifestyle(seeker: UserProfile, candidate: UserProfile): number {
  const seekerLevel = LIFESTYLE_LEVELS[seeker.lifestyle?.toLowerCase() || ""] || 0;
  const candidateLevel = LIFESTYLE_LEVELS[candidate.lifestyle?.toLowerCase() || ""] || 0;

  if (seekerLevel === 0 || candidateLevel === 0) return 50;

  const gap = Math.abs(seekerLevel - candidateLevel);
  if (gap === 0) return 100;
  if (gap === 1) return 50;
  return 0; // Traditional ↔ Liberal = extreme gap
}

function scoreFamilyType(seeker: UserProfile, candidate: UserProfile): number {
  const a = seeker.familyType?.toLowerCase() || "";
  const b = candidate.familyType?.toLowerCase() || "";

  if (!a || !b) return 50;
  return a === b ? 100 : 50;
}

function scoreHobbies(seeker: UserProfile, candidate: UserProfile): number {
  const seekerHobbies = seeker.hobbies || [];
  const candidateHobbies = candidate.hobbies || [];

  if (seekerHobbies.length === 0 || candidateHobbies.length === 0) return 50;

  const seekerSet = new Set(seekerHobbies.map((h) => h.toLowerCase()));
  const common = candidateHobbies.filter((h) => seekerSet.has(h.toLowerCase())).length;
  const maxLen = Math.max(seekerHobbies.length, candidateHobbies.length);

  return Math.round((common / maxLen) * 100);
}

function scoreMotherTongue(seeker: UserProfile, candidate: UserProfile): number {
  const a = seeker.motherTongue?.toLowerCase() || "";
  const b = candidate.motherTongue?.toLowerCase() || "";

  if (!a || !b) return 50;
  if (a === b) return 100;

  // Same language family → partial credit
  const familyA = LANGUAGE_FAMILIES[a] || a;
  const familyB = LANGUAGE_FAMILIES[b] || b;
  if (familyA === familyB) return 50;

  return 25;
}

/**
 * Calculate compatibility score between two profiles.
 * Pure function — no side effects, no Firestore calls.
 */
export function calculateCompatibility(
  seeker: UserProfile,
  candidate: UserProfile
): CompatibilityResult {
  const breakdown: ScoreBreakdown = {
    age: scoreAge(seeker, candidate),
    religion: scoreReligion(seeker, candidate),
    casteGotra: scoreCasteGotra(seeker, candidate),
    location: scoreLocation(seeker, candidate),
    education: scoreEducation(seeker, candidate),
    income: scoreIncome(seeker, candidate),
    diet: scoreDiet(seeker, candidate),
    lifestyle: scoreLifestyle(seeker, candidate),
    familyType: scoreFamilyType(seeker, candidate),
    hobbies: scoreHobbies(seeker, candidate),
    motherTongue: scoreMotherTongue(seeker, candidate),
  };

  const score = Math.round(
    Object.entries(SCORING_WEIGHTS).reduce((total, [key, weight]) => {
      return total + (breakdown[key as keyof ScoreBreakdown] * weight) / 100;
    }, 0)
  );

  return { score, breakdown };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/matching.test.ts`
Expected: All 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add lib/matching.ts lib/matching.test.ts
git commit -m "feat: implement compatibility scoring algorithm with 11 weighted dimensions"
```

---

## Task 3: Cursor-Based Pagination for Profiles

**Files:**
- Modify: `lib/firestore.ts` (add `getProfilesPaginated`)
- Create: `app/api/matches/route.ts`

- [ ] **Step 1: Add pagination function to lib/firestore.ts**

Add the following to the end of `lib/firestore.ts`:

```typescript
import {
  limit,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

export interface PaginatedResult {
  profiles: UserProfile[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

/** Fetch approved profiles with cursor-based pagination */
export async function getProfilesPaginated(
  pageSize: number = 20,
  cursor?: string | null, // createdAt ISO string of last doc
  excludeUid?: string,
  gender?: "male" | "female" | "other"
): Promise<PaginatedResult> {
  let q = query(
    collection(db, "users"),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(pageSize + 1) // fetch one extra to detect hasMore
  );

  if (gender) {
    q = query(
      collection(db, "users"),
      where("status", "==", "approved"),
      where("gender", "==", gender),
      orderBy("createdAt", "desc"),
      limit(pageSize + 1)
    );
  }

  // Note: Firestore requires startAfter to use a DocumentSnapshot.
  // For simplicity in API route, we pass createdAt timestamp and reconstruct.
  // This approach uses the timestamp-based cursor.
  if (cursor) {
    const cursorTimestamp = Timestamp.fromDate(new Date(cursor));
    if (gender) {
      q = query(
        collection(db, "users"),
        where("status", "==", "approved"),
        where("gender", "==", gender),
        orderBy("createdAt", "desc"),
        startAfter(cursorTimestamp),
        limit(pageSize + 1)
      );
    } else {
      q = query(
        collection(db, "users"),
        where("status", "==", "approved"),
        orderBy("createdAt", "desc"),
        startAfter(cursorTimestamp),
        limit(pageSize + 1)
      );
    }
  }

  const snap = await getDocs(q);
  let profiles = snap.docs.map((d) => d.data() as UserProfile);

  // Exclude current user
  if (excludeUid) {
    profiles = profiles.filter((p) => p.uid !== excludeUid);
  }

  const hasMore = profiles.length > pageSize;
  if (hasMore) {
    profiles = profiles.slice(0, pageSize);
  }

  const lastDoc = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;

  return { profiles, lastDoc, hasMore };
}
```

- [ ] **Step 2: Update imports at top of lib/firestore.ts**

Add `limit`, `startAfter`, `orderBy`, `QueryDocumentSnapshot`, `DocumentData` to the existing import from `"firebase/firestore"`.

Updated import:
```typescript
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  limit,
  startAfter,
  orderBy,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";
```

- [ ] **Step 3: Create the /api/matches route**

```typescript
// app/api/matches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calculateCompatibility } from "@/lib/matching";
import { UserProfile } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const cursor = searchParams.get("cursor"); // ISO timestamp
  const pageSize = Math.min(parseInt(searchParams.get("pageSize") || "20"), 50);

  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  // Get seeker profile
  const seekerDoc = await adminDb.collection("users").doc(uid).get();
  if (!seekerDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const seeker = seekerDoc.data() as UserProfile;

  // Determine target gender
  const targetGender = seeker.gender === "male" ? "female" : seeker.gender === "female" ? "male" : undefined;

  // Build query
  let q = adminDb
    .collection("users")
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc")
    .limit(pageSize + 1);

  if (targetGender) {
    q = adminDb
      .collection("users")
      .where("status", "==", "approved")
      .where("gender", "==", targetGender)
      .orderBy("createdAt", "desc")
      .limit(pageSize + 1);
  }

  if (cursor) {
    const cursorDate = new Date(cursor);
    q = q.startAfter(cursorDate);
  }

  const snap = await q.get();
  let profiles = snap.docs
    .map((d) => ({ uid: d.id, ...d.data() } as UserProfile))
    .filter((p) => p.uid !== uid);

  const hasMore = profiles.length > pageSize;
  if (hasMore) {
    profiles = profiles.slice(0, pageSize);
  }

  // Score each profile
  const scored = profiles.map((candidate) => {
    const { score, breakdown } = calculateCompatibility(seeker, candidate);
    return { profile: candidate, score, breakdown };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  // Get cursor for next page
  const lastProfile = profiles[profiles.length - 1];
  const nextCursor = lastProfile?.createdAt
    ? (lastProfile.createdAt as any).toDate?.()?.toISOString() || null
    : null;

  return NextResponse.json({
    matches: scored,
    nextCursor,
    hasMore,
  });
}
```

- [ ] **Step 4: Run build to verify no type errors**

Run: `npx next build`
Expected: Build succeeds (or only pre-existing warnings)

- [ ] **Step 5: Commit**

```bash
git add lib/firestore.ts app/api/matches/route.ts
git commit -m "feat: add cursor-based pagination and scored matches API endpoint"
```

---

## Task 4: Interest Tracking System

**Files:**
- Create: `lib/interests.ts`
- Create: `lib/interests.test.ts`
- Create: `app/api/interests/route.ts`

- [ ] **Step 1: Write failing tests for interest functions**

```typescript
// lib/interests.test.ts
import { describe, it, expect, vi } from "vitest";
import { InterestStatus, validateInterestAction } from "./interests";

describe("interests", () => {
  describe("validateInterestAction", () => {
    it("allows sending interest to a different user", () => {
      const result = validateInterestAction("user1", "user2", "send");
      expect(result.valid).toBe(true);
    });

    it("rejects sending interest to self", () => {
      const result = validateInterestAction("user1", "user1", "send");
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Cannot send interest to yourself");
    });

    it("validates accept action requires valid status", () => {
      const result = validateInterestAction("user1", "user2", "accept");
      expect(result.valid).toBe(true);
    });

    it("validates decline action requires valid status", () => {
      const result = validateInterestAction("user1", "user2", "decline");
      expect(result.valid).toBe(true);
    });

    it("rejects invalid action type", () => {
      const result = validateInterestAction("user1", "user2", "invalid" as any);
      expect(result.valid).toBe(false);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/interests.test.ts`
Expected: FAIL — cannot find module `./interests`

- [ ] **Step 3: Implement interests module**

```typescript
// lib/interests.ts
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
  addDoc,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase";

export type InterestStatus = "pending" | "accepted" | "declined" | "expired";
export type InterestAction = "send" | "accept" | "decline";

export interface Interest {
  id?: string;
  fromUserId: string;
  toUserId: string;
  status: InterestStatus;
  createdAt: Timestamp | null;
  expiresAt: Timestamp | null;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate an interest action (pure function, no DB calls) */
export function validateInterestAction(
  fromUserId: string,
  toUserId: string,
  action: InterestAction
): ValidationResult {
  if (action === "send" && fromUserId === toUserId) {
    return { valid: false, error: "Cannot send interest to yourself" };
  }

  const validActions: InterestAction[] = ["send", "accept", "decline"];
  if (!validActions.includes(action)) {
    return { valid: false, error: "Invalid action" };
  }

  return { valid: true };
}

/** Send interest from one user to another */
export async function sendInterest(
  fromUserId: string,
  toUserId: string
): Promise<{ success: boolean; error?: string; isMutual?: boolean }> {
  const validation = validateInterestAction(fromUserId, toUserId, "send");
  if (!validation.valid) return { success: false, error: validation.error };

  // Check if interest already exists
  const existing = await getInterestBetween(fromUserId, toUserId);
  if (existing) {
    return { success: false, error: "Interest already sent" };
  }

  // Check if the other person already sent interest (mutual match!)
  const reverse = await getInterestBetween(toUserId, fromUserId);
  if (reverse && reverse.status === "pending") {
    // Mutual match! Accept both
    await updateDoc(doc(db, "interests", reverse.id!), {
      status: "accepted",
    });
    await addDoc(collection(db, "interests"), {
      fromUserId,
      toUserId,
      status: "accepted",
      createdAt: serverTimestamp(),
      expiresAt: null,
    });
    return { success: true, isMutual: true };
  }

  // Create new interest with 30-day expiry
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  await addDoc(collection(db, "interests"), {
    fromUserId,
    toUserId,
    status: "pending",
    createdAt: serverTimestamp(),
    expiresAt,
  });

  return { success: true, isMutual: false };
}

/** Accept an interest */
export async function acceptInterest(interestId: string): Promise<void> {
  await updateDoc(doc(db, "interests", interestId), {
    status: "accepted",
  });
}

/** Decline an interest */
export async function declineInterest(interestId: string): Promise<void> {
  await updateDoc(doc(db, "interests", interestId), {
    status: "declined",
  });
}

/** Get interest between two users (from → to) */
export async function getInterestBetween(
  fromUserId: string,
  toUserId: string
): Promise<(Interest & { id: string }) | null> {
  const q = query(
    collection(db, "interests"),
    where("fromUserId", "==", fromUserId),
    where("toUserId", "==", toUserId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() } as Interest & { id: string };
}

/** Get all interests received by a user */
export async function getReceivedInterests(
  userId: string,
  status?: InterestStatus
): Promise<(Interest & { id: string })[]> {
  let q = query(
    collection(db, "interests"),
    where("toUserId", "==", userId),
    orderBy("createdAt", "desc")
  );

  if (status) {
    q = query(
      collection(db, "interests"),
      where("toUserId", "==", userId),
      where("status", "==", status),
      orderBy("createdAt", "desc")
    );
  }

  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest & { id: string }));
}

/** Get all interests sent by a user */
export async function getSentInterests(
  userId: string
): Promise<(Interest & { id: string })[]> {
  const q = query(
    collection(db, "interests"),
    where("fromUserId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Interest & { id: string }));
}

/** Count pending interests received (for badge display) */
export async function countPendingInterests(userId: string): Promise<number> {
  const q = query(
    collection(db, "interests"),
    where("toUserId", "==", userId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(q);
  return snap.size;
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/interests.test.ts`
Expected: All 5 tests pass

- [ ] **Step 5: Create the API route for interests**

```typescript
// app/api/interests/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { fromUserId, toUserId, action, interestId } = body;

  if (!fromUserId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  if (action === "send") {
    if (!toUserId) {
      return NextResponse.json({ error: "toUserId required" }, { status: 400 });
    }
    if (fromUserId === toUserId) {
      return NextResponse.json({ error: "Cannot send interest to yourself" }, { status: 400 });
    }

    // Check for existing pending interest
    const existingSnap = await adminDb
      .collection("interests")
      .where("fromUserId", "==", fromUserId)
      .where("toUserId", "==", toUserId)
      .where("status", "==", "pending")
      .get();

    if (!existingSnap.empty) {
      return NextResponse.json({ error: "Interest already sent" }, { status: 409 });
    }

    // Check for mutual match
    const reverseSnap = await adminDb
      .collection("interests")
      .where("fromUserId", "==", toUserId)
      .where("toUserId", "==", fromUserId)
      .where("status", "==", "pending")
      .get();

    if (!reverseSnap.empty) {
      // Mutual match!
      const reverseDoc = reverseSnap.docs[0];
      await reverseDoc.ref.update({ status: "accepted" });
      await adminDb.collection("interests").add({
        fromUserId,
        toUserId,
        status: "accepted",
        createdAt: new Date(),
        expiresAt: null,
      });
      return NextResponse.json({ success: true, isMutual: true });
    }

    // Create new interest
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await adminDb.collection("interests").add({
      fromUserId,
      toUserId,
      status: "pending",
      createdAt: new Date(),
      expiresAt,
    });

    return NextResponse.json({ success: true, isMutual: false });
  }

  if (action === "accept" || action === "decline") {
    if (!interestId) {
      return NextResponse.json({ error: "interestId required" }, { status: 400 });
    }
    await adminDb.collection("interests").doc(interestId).update({
      status: action === "accept" ? "accepted" : "declined",
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const type = searchParams.get("type") || "received"; // "received" | "sent"
  const status = searchParams.get("status"); // optional filter

  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const adminDb = getAdminDb();
  const field = type === "sent" ? "fromUserId" : "toUserId";

  let q = adminDb
    .collection("interests")
    .where(field, "==", uid)
    .orderBy("createdAt", "desc")
    .limit(50);

  if (status) {
    q = adminDb
      .collection("interests")
      .where(field, "==", uid)
      .where("status", "==", status)
      .orderBy("createdAt", "desc")
      .limit(50);
  }

  const snap = await q.get();
  const interests = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ interests });
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/interests.ts lib/interests.test.ts app/api/interests/route.ts
git commit -m "feat: add interest tracking system with mutual match detection"
```

---

## Task 5: Shortlist / Favorites System

**Files:**
- Create: `lib/shortlist.ts`
- Create: `lib/shortlist.test.ts`
- Create: `app/api/shortlist/route.ts`

- [ ] **Step 1: Write failing tests for shortlist**

```typescript
// lib/shortlist.test.ts
import { describe, it, expect } from "vitest";
import { validateShortlistAction } from "./shortlist";

describe("shortlist", () => {
  it("allows adding a different user to shortlist", () => {
    const result = validateShortlistAction("user1", "user2");
    expect(result.valid).toBe(true);
  });

  it("rejects adding self to shortlist", () => {
    const result = validateShortlistAction("user1", "user1");
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Cannot shortlist yourself");
  });

  it("rejects empty user IDs", () => {
    const result = validateShortlistAction("", "user2");
    expect(result.valid).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run lib/shortlist.test.ts`
Expected: FAIL — cannot find module `./shortlist`

- [ ] **Step 3: Implement shortlist module**

```typescript
// lib/shortlist.ts
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ShortlistEntry {
  profileId: string;
  addedAt: Timestamp | null;
  notes?: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Validate a shortlist action (pure function) */
export function validateShortlistAction(
  userId: string,
  profileId: string
): ValidationResult {
  if (!userId || !profileId) {
    return { valid: false, error: "User ID and profile ID are required" };
  }
  if (userId === profileId) {
    return { valid: false, error: "Cannot shortlist yourself" };
  }
  return { valid: true };
}

/** Add a profile to user's shortlist */
export async function addToShortlist(
  userId: string,
  profileId: string,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  const validation = validateShortlistAction(userId, profileId);
  if (!validation.valid) return { success: false, error: validation.error };

  await setDoc(
    doc(db, "shortlists", userId, "profiles", profileId),
    {
      profileId,
      addedAt: serverTimestamp(),
      ...(notes ? { notes } : {}),
    }
  );

  return { success: true };
}

/** Remove a profile from user's shortlist */
export async function removeFromShortlist(
  userId: string,
  profileId: string
): Promise<void> {
  await deleteDoc(doc(db, "shortlists", userId, "profiles", profileId));
}

/** Get all shortlisted profiles for a user */
export async function getShortlist(
  userId: string
): Promise<ShortlistEntry[]> {
  const q = query(
    collection(db, "shortlists", userId, "profiles"),
    orderBy("addedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as ShortlistEntry);
}

/** Check if a profile is in user's shortlist */
export async function isShortlisted(
  userId: string,
  profileId: string
): Promise<boolean> {
  const { getDoc: getDocFn } = await import("firebase/firestore");
  const snap = await getDocFn(doc(db, "shortlists", userId, "profiles", profileId));
  return snap.exists();
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run lib/shortlist.test.ts`
Expected: All 3 tests pass

- [ ] **Step 5: Create the API route for shortlist**

```typescript
// app/api/shortlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, profileId, notes, action } = body;

  if (!userId || !profileId) {
    return NextResponse.json({ error: "userId and profileId required" }, { status: 400 });
  }

  if (userId === profileId) {
    return NextResponse.json({ error: "Cannot shortlist yourself" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  if (action === "remove") {
    await adminDb
      .collection("shortlists")
      .doc(userId)
      .collection("profiles")
      .doc(profileId)
      .delete();
    return NextResponse.json({ success: true });
  }

  // Default: add
  await adminDb
    .collection("shortlists")
    .doc(userId)
    .collection("profiles")
    .doc(profileId)
    .set({
      profileId,
      addedAt: new Date(),
      ...(notes ? { notes } : {}),
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
    .collection("shortlists")
    .doc(uid)
    .collection("profiles")
    .orderBy("addedAt", "desc")
    .get();

  const profiles = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  return NextResponse.json({ shortlist: profiles });
}
```

- [ ] **Step 6: Commit**

```bash
git add lib/shortlist.ts lib/shortlist.test.ts app/api/shortlist/route.ts
git commit -m "feat: add shortlist/favorites system with notes"
```

---

## Task 6: Daily Recommendations API

**Files:**
- Create: `app/api/recommendations/route.ts`

- [ ] **Step 1: Create the recommendations endpoint**

```typescript
// app/api/recommendations/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { calculateCompatibility } from "@/lib/matching";
import { UserProfile } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get("uid");
  const count = Math.min(parseInt(searchParams.get("count") || "10"), 20);

  if (!uid) {
    return NextResponse.json({ error: "uid required" }, { status: 400 });
  }

  const adminDb = getAdminDb();

  // Get seeker profile
  const seekerDoc = await adminDb.collection("users").doc(uid).get();
  if (!seekerDoc.exists) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const seeker = { uid: seekerDoc.id, ...seekerDoc.data() } as UserProfile;

  // Determine target gender
  const targetGender = seeker.gender === "male" ? "female" : seeker.gender === "female" ? "male" : undefined;

  // Get already-seen profiles (interactions)
  const interactionsSnap = await adminDb
    .collection("user_interactions")
    .where("userId", "==", uid)
    .get();
  const seenIds = new Set(interactionsSnap.docs.map((d) => d.data().targetProfileId));

  // Get blocked users
  const blockedSnap = await adminDb
    .collection("blocked_users")
    .doc(uid)
    .collection("blocked")
    .get();
  const blockedIds = new Set(blockedSnap.docs.map((d) => d.id));

  // Fetch approved candidates
  let candidatesQuery = adminDb
    .collection("users")
    .where("status", "==", "approved");

  if (targetGender) {
    candidatesQuery = candidatesQuery.where("gender", "==", targetGender);
  }

  const candidatesSnap = await candidatesQuery.limit(200).get();

  // Score and filter candidates
  const scored: { profile: UserProfile; score: number }[] = [];

  for (const candidateDoc of candidatesSnap.docs) {
    const candidate = { uid: candidateDoc.id, ...candidateDoc.data() } as UserProfile;

    // Skip: self, already seen, blocked, same gotra
    if (candidate.uid === uid) continue;
    if (seenIds.has(candidate.uid)) continue;
    if (blockedIds.has(candidate.uid)) continue;
    if (
      seeker.gotra &&
      candidate.gotra &&
      seeker.gotra.toLowerCase() === candidate.gotra.toLowerCase()
    ) continue;

    const { score } = calculateCompatibility(seeker, candidate);
    scored.push({ profile: candidate, score });
  }

  // Sort by score and take top N
  scored.sort((a, b) => b.score - a.score);
  const recommendations = scored.slice(0, count);

  return NextResponse.json({
    recommendations,
    generatedAt: new Date().toISOString(),
  });
}
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/api/recommendations/route.ts
git commit -m "feat: add daily recommendations endpoint with exclusion filters"
```

---

## Task 7: CompatibilityBadge UI Component

**Files:**
- Create: `components/CompatibilityBadge.tsx`

- [ ] **Step 1: Create the CompatibilityBadge component**

```typescript
// components/CompatibilityBadge.tsx
"use client";

import { ScoreBreakdown } from "@/lib/matching";
import { useState } from "react";

interface CompatibilityBadgeProps {
  score: number;
  breakdown?: ScoreBreakdown;
  size?: "sm" | "md" | "lg";
}

function getScoreColor(score: number): string {
  if (score >= 80) return "bg-green-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-gray-400";
}

function getScoreTextColor(score: number): string {
  if (score >= 80) return "text-green-700";
  if (score >= 60) return "text-amber-700";
  return "text-gray-600";
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return "bg-green-50 border-green-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-gray-50 border-gray-200";
}

const DIMENSION_LABELS: Record<keyof ScoreBreakdown, string> = {
  age: "Age",
  religion: "Religion",
  casteGotra: "Caste & Gotra",
  location: "Location",
  education: "Education",
  income: "Income",
  diet: "Diet",
  lifestyle: "Lifestyle",
  familyType: "Family Type",
  hobbies: "Hobbies",
  motherTongue: "Language",
};

export default function CompatibilityBadge({
  score,
  breakdown,
  size = "md",
}: CompatibilityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
    lg: "text-base px-4 py-1.5",
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className={`${sizeClasses[size]} ${getScoreBgColor(score)} border rounded-full font-bold ${getScoreTextColor(score)} cursor-pointer transition-all hover:scale-105`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
      >
        {score}% Match
      </button>

      {showTooltip && breakdown && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 text-left">
          <p className="text-xs font-bold text-gray-800 mb-2">Compatibility Breakdown</p>
          <div className="space-y-1.5">
            {Object.entries(breakdown).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-20 truncate">
                  {DIMENSION_LABELS[key as keyof ScoreBreakdown]}
                </span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${getScoreColor(value)}`}
                    style={{ width: `${value}%` }}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-600 w-7 text-right">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/CompatibilityBadge.tsx
git commit -m "feat: add CompatibilityBadge component with tooltip breakdown"
```

---

## Task 8: ShortlistButton UI Component

**Files:**
- Create: `components/ShortlistButton.tsx`

- [ ] **Step 1: Create the ShortlistButton component**

```typescript
// components/ShortlistButton.tsx
"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isShortlisted, addToShortlist, removeFromShortlist } from "@/lib/shortlist";
import { toast } from "sonner";

interface ShortlistButtonProps {
  profileId: string;
  className?: string;
}

export default function ShortlistButton({ profileId, className = "" }: ShortlistButtonProps) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    isShortlisted(user.uid, profileId)
      .then(setSaved)
      .finally(() => setLoading(false));
  }, [user, profileId]);

  const handleToggle = async () => {
    if (!user) {
      toast.error("Please sign in to save profiles");
      return;
    }

    setLoading(true);
    try {
      if (saved) {
        await removeFromShortlist(user.uid, profileId);
        setSaved(false);
        toast.success("Removed from saved profiles");
      } else {
        await addToShortlist(user.uid, profileId);
        setSaved(true);
        toast.success("Added to saved profiles");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-all ${
        saved
          ? "bg-red-50 text-red-500 hover:bg-red-100"
          : "bg-white/80 text-gray-400 hover:text-red-400 hover:bg-red-50"
      } ${className}`}
      title={saved ? "Remove from saved" : "Save profile"}
    >
      <Heart className={`w-5 h-5 ${saved ? "fill-current" : ""}`} />
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/ShortlistButton.tsx
git commit -m "feat: add ShortlistButton toggle component"
```

---

## Task 9: Update Matches Page — Tabs, Pagination, Score Badges

**Files:**
- Modify: `app/matches/page.tsx`

This is the largest UI change. We replace the "load all at once" approach with a tabbed interface:
- **"For You" tab** (default): Shows daily recommendations with compatibility scores
- **"Browse" tab**: Paginated browsing with existing filters

- [ ] **Step 1: Rewrite the matches page with tabs and scored profiles**

Replace the entire content of `app/matches/page.tsx`:

```typescript
// app/matches/page.tsx
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { UserProfile } from "@/lib/firestore";
import { ScoreBreakdown } from "@/lib/matching";
import { logInteraction } from "@/lib/analytics";
import { getOrCreateChatSession, sendMessage, subscribeToMessages, ChatMessage, ChatSession } from "@/lib/chat";
import { createNotification } from "@/lib/notifications";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import ShortlistButton from "@/components/ShortlistButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Crown, Heart, X, MapPin, Briefcase, GraduationCap,
  MessageCircle, Send, Info, ChevronLeft, ChevronRight,
  Filter, Star, Sparkles, ArrowLeft, Loader2
} from "lucide-react";
import PremiumModal from "@/components/PremiumModal";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ScoredProfile {
  profile: UserProfile;
  score: number;
  breakdown?: ScoreBreakdown;
}

interface FilterState {
  minAge: number;
  maxAge: number;
  religion: string;
  location: string;
}

type Tab = "foryou" | "browse";

export default function MatchesPage() {
  const { user, userProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("foryou");
  const [recommendations, setRecommendations] = useState<ScoredProfile[]>([]);
  const [browseProfiles, setBrowseProfiles] = useState<ScoredProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatProfile, setChatProfile] = useState<UserProfile | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const [filters, setFilters] = useState<FilterState>({
    minAge: 18,
    maxAge: 50,
    religion: "Any",
    location: "Any",
  });

  const viewStartTime = useRef<number>(Date.now());

  // Fetch recommendations (For You tab)
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    fetch(`/api/recommendations?uid=${user.uid}&count=10`)
      .then((res) => res.json())
      .then((data) => {
        setRecommendations(data.recommendations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid]);

  // Fetch browse profiles (Browse tab)
  const fetchBrowseProfiles = useCallback(async (reset = false) => {
    if (!user?.uid) return;
    if (reset) {
      setLoadingMore(false);
      setBrowseProfiles([]);
      setNextCursor(null);
      setHasMore(true);
    }

    setLoadingMore(true);
    try {
      const params = new URLSearchParams({
        uid: user.uid,
        pageSize: "20",
      });
      if (!reset && nextCursor) params.set("cursor", nextCursor);

      const res = await fetch(`/api/matches?${params}`);
      const data = await res.json();

      const newProfiles: ScoredProfile[] = (data.matches || []).map((m: any) => ({
        profile: m.profile,
        score: m.score,
        breakdown: m.breakdown,
      }));

      if (reset) {
        setBrowseProfiles(newProfiles);
      } else {
        setBrowseProfiles((prev) => [...prev, ...newProfiles]);
      }
      setNextCursor(data.nextCursor || null);
      setHasMore(data.hasMore || false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMore(false);
    }
  }, [user?.uid, nextCursor]);

  useEffect(() => {
    if (activeTab === "browse" && browseProfiles.length === 0 && user?.uid) {
      fetchBrowseProfiles(true);
    }
  }, [activeTab, user?.uid]);

  // Filter browse profiles client-side
  const filteredBrowse = browseProfiles.filter((item) => {
    const p = item.profile;
    const age = p.age || 25;
    if (age < filters.minAge || age > filters.maxAge) return false;
    if (filters.religion !== "Any" && p.religion?.toLowerCase() !== filters.religion.toLowerCase()) return false;
    if (filters.location !== "Any" && !p.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });

  const displayProfiles = activeTab === "foryou" ? recommendations : filteredBrowse;
  const currentProfile = displayProfiles[currentIndex];

  const handleSwipe = useCallback(async (direction: "left" | "right", item: ScoredProfile) => {
    if (!user) {
      toast.error("Please sign in to interact");
      return;
    }
    const timeSpent = Date.now() - viewStartTime.current;
    logInteraction(user.uid, item.profile.uid, direction === "right" ? "swipe_right" : "swipe_left", timeSpent);

    if (direction === "right") {
      // Send interest via API
      try {
        const res = await fetch("/api/interests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromUserId: user.uid,
            toUserId: item.profile.uid,
            action: "send",
          }),
        });
        const data = await res.json();
        if (data.isMutual) {
          toast.success(`It's a mutual match with ${item.profile.name}!`);
        } else if (data.success) {
          toast.success(`Interest sent to ${item.profile.name}!`);
        } else {
          toast.info(data.error || "Could not send interest");
        }
      } catch {
        toast.error("Failed to send interest");
      }
    }

    setCurrentIndex((prev) => prev + 1);
    viewStartTime.current = Date.now();

    // Load more if near the end (browse tab)
    if (activeTab === "browse" && currentIndex >= displayProfiles.length - 3 && hasMore) {
      fetchBrowseProfiles();
    }
  }, [user, currentIndex, displayProfiles.length, hasMore, activeTab, fetchBrowseProfiles]);

  useEffect(() => {
    setCurrentIndex(0);
    viewStartTime.current = Date.now();
  }, [filters, activeTab]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[var(--background)] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex overflow-hidden w-full max-w-[1800px] mx-auto">
        {/* Left Sidebar — Tabs + Filters */}
        <aside className="hidden lg:flex w-[300px] flex-shrink-0 border-r border-[var(--outline-variant)]/20 bg-white/50 backdrop-blur-sm p-6 flex-col">
          {/* Tab Switcher */}
          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6">
            <button
              onClick={() => setActiveTab("foryou")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "foryou"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" /> For You
            </button>
            <button
              onClick={() => setActiveTab("browse")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                activeTab === "browse"
                  ? "bg-white text-[var(--primary)] shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Filter className="w-3 h-3 inline mr-1" /> Browse
            </button>
          </div>

          {activeTab === "browse" && (
            <>
              <div className="mb-4">
                <h2 className="font-serif text-lg font-bold text-[var(--on-surface)] flex items-center gap-2 mb-1">
                  <Filter className="w-4 h-4 text-[var(--primary)]" /> Filters
                </h2>
                <p className="text-xs text-[var(--on-surface-variant)]">Refine your discovery</p>
              </div>

              <div className="space-y-6 flex-1">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">Age Range</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={filters.minAge}
                      onChange={(e) => setFilters((prev) => ({ ...prev, minAge: parseInt(e.target.value) || 18 }))}
                      className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold"
                    />
                    <span className="text-[var(--outline)]">-</span>
                    <input
                      type="number"
                      value={filters.maxAge}
                      onChange={(e) => setFilters((prev) => ({ ...prev, maxAge: parseInt(e.target.value) || 50 }))}
                      className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">Religion</p>
                  <select
                    value={filters.religion}
                    onChange={(e) => setFilters((prev) => ({ ...prev, religion: e.target.value }))}
                    className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold appearance-none"
                  >
                    <option value="Any">Any Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Sikh">Sikh</option>
                    <option value="Christian">Christian</option>
                    <option value="Jain">Jain</option>
                    <option value="Buddhist">Buddhist</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--outline)]">Location</p>
                  <input
                    type="text"
                    placeholder="City name..."
                    value={filters.location === "Any" ? "" : filters.location}
                    onChange={(e) => setFilters((prev) => ({ ...prev, location: e.target.value || "Any" }))}
                    className="w-full h-9 rounded-xl border border-[var(--outline-variant)]/20 bg-white px-3 text-xs font-bold"
                  />
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-[10px] uppercase font-bold text-[var(--primary)] tracking-widest"
                  onClick={() => setFilters({ minAge: 18, maxAge: 50, religion: "Any", location: "Any" })}
                >
                  Reset Filters
                </Button>
              </div>
            </>
          )}

          {activeTab === "foryou" && (
            <div className="flex-1 flex flex-col">
              <div className="mb-4">
                <h2 className="font-serif text-lg font-bold text-[var(--on-surface)] flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-[var(--primary)]" /> Today&apos;s Picks
                </h2>
                <p className="text-xs text-[var(--on-surface-variant)]">
                  AI-matched profiles based on your preferences
                </p>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {recommendations.map((item, i) => (
                  <button
                    key={item.profile.uid}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left ${
                      currentIndex === i
                        ? "bg-[var(--primary-container)]/30 border border-[var(--primary)]/20"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-200">
                      <Image
                        src={item.profile.photoURL || `https://ui-avatars.com/api/?name=${item.profile.name}&size=40`}
                        alt={item.profile.name}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.profile.name}</p>
                      <p className="text-[10px] text-gray-500">{item.profile.location}</p>
                    </div>
                    <CompatibilityBadge score={item.score} size="sm" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-auto pt-4 p-4 rounded-2xl bg-gradient-to-br from-[var(--primary)]/10 to-[var(--secondary)]/5 border border-[var(--primary)]/10">
            <p className="text-xs font-bold text-[var(--primary)] mb-1 flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" /> Matches Found
            </p>
            <p className="text-[10px] text-[var(--on-surface-variant)] leading-relaxed">
              {displayProfiles.length} profiles matching your criteria.
            </p>
          </div>
        </aside>

        {/* Center: Discovery Content */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[var(--surface-container-lowest)]">
          {displayProfiles.length === 0 || currentIndex >= displayProfiles.length ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-20 h-20 bg-[var(--primary-container)]/30 rounded-full flex items-center justify-center mb-6">
                <Sparkles className="w-10 h-10 text-[var(--primary)]" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-[var(--on-surface)] mb-2">
                {activeTab === "foryou" ? "No Recommendations Yet" : "No More Matches"}
              </h2>
              <p className="text-sm text-[var(--on-surface-variant)] mb-4">
                {activeTab === "foryou"
                  ? "Complete your profile for better recommendations"
                  : "Try adjusting your filters or check back later"
                }
              </p>
              {activeTab === "browse" && (
                <Button
                  onClick={() => setFilters({ minAge: 18, maxAge: 50, religion: "Any", location: "Any" })}
                  className="gold-gradient text-white rounded-full px-8 shadow-lg"
                >
                  Reset All Filters
                </Button>
              )}
            </div>
          ) : currentProfile && (
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden p-4 sm:p-6 lg:p-8 gap-8">
              {/* Profile Picture */}
              <div className="flex-1 relative rounded-[40px] overflow-hidden shadow-2xl group border border-white/20">
                <Image
                  src={currentProfile.profile.photos?.[0] || currentProfile.profile.photoURL || `https://ui-avatars.com/api/?name=${currentProfile.profile.name}&size=800`}
                  alt={currentProfile.profile.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />

                {/* Shortlist button overlay */}
                <div className="absolute top-4 right-4 z-20">
                  <ShortlistButton profileId={currentProfile.profile.uid} className="shadow-lg" />
                </div>

                {/* Compatibility badge overlay */}
                <div className="absolute top-4 left-4 z-20">
                  <CompatibilityBadge
                    score={currentProfile.score}
                    breakdown={currentProfile.breakdown}
                    size="lg"
                  />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 z-20 pointer-events-none">
                  <h2 className="font-serif text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-2">
                    {currentProfile.profile.name}, {currentProfile.profile.age}
                  </h2>
                  <div className="flex items-center gap-3 text-white/90 text-sm">
                    <span><MapPin className="w-4 h-4 inline mr-1" /> {currentProfile.profile.location}</span>
                    <span><Briefcase className="w-4 h-4 inline mr-1" /> {currentProfile.profile.occupation || "Independent"}</span>
                  </div>
                </div>
              </div>

              {/* Details Area */}
              <div className="w-full lg:w-[450px] flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2">
                <div className="bg-white rounded-[32px] p-8 shadow-sm border border-[var(--outline-variant)]/20 space-y-8">
                  {currentProfile.profile.bio && (
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]">About Me</h3>
                      <p className="text-base text-[var(--on-surface-variant)] italic font-medium">&ldquo;{currentProfile.profile.bio}&rdquo;</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-[var(--outline-variant)]/10">
                    <DetailedStat label="Marital Status" value={currentProfile.profile.maritalStatus} />
                    <DetailedStat label="Religion" value={currentProfile.profile.religion} />
                    <DetailedStat label="Caste" value={currentProfile.profile.caste} />
                    <DetailedStat label="Gotra" value={currentProfile.profile.gotra} />
                    <DetailedStat label="Diet" value={currentProfile.profile.diet} />
                    <DetailedStat label="Family" value={currentProfile.profile.familyType} />
                    <DetailedStat label="Education" value={currentProfile.profile.education} />
                    <DetailedStat label="Language" value={currentProfile.profile.motherTongue} />
                  </div>

                  {/* Action Bar */}
                  <div className="pt-8 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleSwipe("left", currentProfile)}
                      className="flex-1 h-14 rounded-2xl bg-white border border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm"
                    >
                      <X className="w-6 h-6 mr-2" /> <span className="font-bold">Pass</span>
                    </button>
                    <button
                      onClick={() => handleSwipe("right", currentProfile)}
                      className="flex-1 h-14 rounded-2xl gold-gradient flex items-center justify-center text-white shadow-xl hover:opacity-90 transition-all"
                    >
                      <Heart className="w-6 h-6 mr-2 fill-current" /> <span className="font-bold">Interested</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => { setChatProfile(currentProfile.profile); setChatOpen(true); }}
                  className="w-full bg-[var(--primary-container)]/30 hover:bg-[var(--primary-container)]/50 p-6 rounded-[32px] flex items-center justify-center gap-3 transition-all border border-[var(--primary)]/10"
                >
                  <MessageCircle className="w-5 h-5 text-[var(--primary)]" />
                  <span className="text-sm font-bold text-[var(--primary)]">Send Intro Message</span>
                </button>

                {/* Load More (Browse tab) */}
                {activeTab === "browse" && currentIndex >= displayProfiles.length - 1 && hasMore && (
                  <Button
                    onClick={() => fetchBrowseProfiles()}
                    disabled={loadingMore}
                    className="w-full rounded-2xl"
                    variant="outline"
                  >
                    {loadingMore ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Load More Profiles
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Chat Panel */}
      <AnimatePresence>
        {chatOpen && chatProfile && user && (
          <ChatPanel
            profile={chatProfile}
            currentUser={user}
            currentUserProfile={userProfile}
            onClose={() => { setChatOpen(false); setChatProfile(null); }}
            onRequirePremium={() => setShowPremiumModal(true)}
          />
        )}
      </AnimatePresence>

      <PremiumModal open={showPremiumModal} onClose={() => setShowPremiumModal(false)} />
    </div>
  );
}

function ChatPanel({
  profile,
  currentUser,
  currentUserProfile,
  onClose,
  onRequirePremium,
}: {
  profile: UserProfile;
  currentUser: any;
  currentUserProfile: any;
  onClose: () => void;
  onRequirePremium: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<ChatSession | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function initChat() {
      const sid = await getOrCreateChatSession(currentUser.uid, profile.uid);
      setSessionId(sid);
      return subscribeToMessages(sid, setMessages);
    }
    initChat();
  }, [currentUser.uid, profile.uid]);

  const myMessageCount = messages.filter((m) => m.senderId === currentUser.uid).length;
  const status = sessionData?.status || "pending";
  const isPremium = currentUserProfile?.is_premium === true;
  const canSend = status === "pending" ? myMessageCount < 3 : isPremium;

  const handleSend = async () => {
    if (!input.trim() || !sessionId || !canSend) {
      if (!canSend) {
        if (status === "pending") toast.error("Intro limit reached. Wait for acceptance.");
        else onRequirePremium();
      }
      return;
    }

    const text = input.trim();
    setInput("");
    const success = await sendMessage(sessionId, currentUser.uid, text);
    if (success) {
      await createNotification({
        userId: profile.uid,
        type: "message",
        title: "New message",
        body: `${currentUserProfile?.name || "Someone"}: ${text.substring(0, 50)}...`,
        actionUrl: `/chat/${sessionId}`,
        fromUserId: currentUser.uid,
        fromUserName: currentUserProfile?.name || "",
      });
    }
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  return (
    <motion.div
      initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
      className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-white shadow-2xl z-50 flex flex-col border-l border-[var(--outline-variant)]/20"
    >
      <div className="p-4 border-b flex items-center gap-3">
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft className="w-5 h-5" /></button>
        <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-bold">{profile.name[0]}</div>
        <div className="flex-1">
          <p className="font-bold text-sm">{profile.name}</p>
          <p className="text-[10px] text-green-600">{canSend ? `${3 - myMessageCount} intro messages left` : "Limit reached"}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.senderId === currentUser.uid ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === currentUser.uid ? "bg-[var(--primary)] text-white" : "bg-gray-100"}`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder={canSend ? "Type a message..." : "Limit reached"}
          className="flex-1 rounded-full"
          disabled={!canSend}
        />
        <Button onClick={handleSend} disabled={!canSend} className="gold-gradient rounded-full w-10 h-10 p-0"><Send className="w-4 h-4" /></Button>
      </div>
    </motion.div>
  );
}

function DetailedStat({ label, value }: { label: string; value?: string }) {
  if (!value || value === "undefined") return null;
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-medium text-[var(--outline)] uppercase">{label}</p>
      <p className="text-sm font-bold text-[var(--on-surface)] capitalize">{value}</p>
    </div>
  );
}
```

- [ ] **Step 2: Run build to verify**

Run: `npx next build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add app/matches/page.tsx
git commit -m "feat: rewrite matches page with For You/Browse tabs, pagination, and compatibility scores"
```

---

## Task 10: Firestore Indexes and Security Rules

**Files:**
- Create: `firestore.indexes.json`
- Create: `firestore.rules` (documentation for manual Firebase Console setup)

- [ ] **Step 1: Create Firestore composite index definitions**

```json
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "gender", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "interests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fromUserId", "order": "ASCENDING" },
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "interests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "toUserId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "interests",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "fromUserId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "user_interactions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

- [ ] **Step 2: Create security rules documentation**

```
// firestore.rules
// Deploy via Firebase Console > Firestore > Rules
// These rules enforce read/write restrictions for the matchmaking collections

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId;
      allow update: if request.auth != null && request.auth.uid == userId;
      allow delete: if false; // Only via admin SDK
    }

    // Interests collection
    match /interests/{interestId} {
      allow read: if request.auth != null &&
        (resource.data.fromUserId == request.auth.uid ||
         resource.data.toUserId == request.auth.uid);
      allow create: if request.auth != null &&
        request.resource.data.fromUserId == request.auth.uid;
      allow update: if request.auth != null &&
        resource.data.toUserId == request.auth.uid; // Only receiver can accept/decline
      allow delete: if false;
    }

    // Shortlists subcollection
    match /shortlists/{userId}/profiles/{profileId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat sessions
    match /chat_sessions/{sessionId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow create: if request.auth != null;
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.participants;

      match /messages/{messageId} {
        allow read: if request.auth != null;
        allow create: if request.auth != null;
      }
    }

    // User interactions (analytics)
    match /user_interactions/{docId} {
      allow create: if request.auth != null &&
        request.resource.data.userId == request.auth.uid;
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
    }

    // Blocked users
    match /blocked_users/{userId}/blocked/{blockedId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add firestore.indexes.json firestore.rules
git commit -m "docs: add Firestore composite indexes and security rules for matchmaking"
```

---

## Task 11: Integration Verification

- [ ] **Step 1: Run all unit tests**

Run: `npx vitest run`
Expected: All tests pass (matching, interests, shortlist)

- [ ] **Step 2: Run build**

Run: `npx next build`
Expected: Build succeeds without errors

- [ ] **Step 3: Verify no TypeScript errors**

Run: `npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 4: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix: resolve any type errors from Phase 1 integration"
```

---

## Summary

After completing all 11 tasks, Phase 1 delivers:

| Feature | Implementation |
|---------|---------------|
| Compatibility Scoring | 11-dimension weighted algorithm in `lib/matching.ts` |
| Paginated Browsing | Cursor-based via `/api/matches` with 20 profiles/page |
| Daily Recommendations | Top-10 scored profiles via `/api/recommendations` |
| Interest Tracking | Send/accept/decline with mutual match detection |
| Shortlist/Favorites | User subcollection with add/remove/check |
| Compatibility Badge | Color-coded score with dimension breakdown tooltip |
| Tabbed Match Page | "For You" (AI picks) + "Browse" (filters + pagination) |
| Firestore Indexes | Composite indexes for all new query patterns |
| Security Rules | Field-level access control for all collections |

**Next:** Phase 2 — Trust, Safety & Admin (block/report, admin panel, rate limiting, email verification)

