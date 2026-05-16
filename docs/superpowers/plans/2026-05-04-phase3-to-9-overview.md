# Phases 3-9: Complete Feature Roadmap — Implementation Plan


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.


**Goal:** Implement all remaining phases after the core foundation (Phases 1-2) is complete — covering family features, AI, communication, monetization, accessibility, competitive moat, and offline-to-online bridge.


**Architecture:** Each phase builds incrementally on the previous. All new features follow the same patterns: lib module with pure logic + API route with Admin SDK + client component consuming the API. Firestore for data, Cloudinary for media, Claude API for AI.


**Tech Stack:** Next.js 16 App Router, TypeScript, Firebase (Firestore + Auth + Storage + Cloud Functions), Claude API (Haiku), Twilio (Video + WhatsApp + SMS), Razorpay (UPI + Subscriptions), next-intl (i18n), @react-pdf/renderer (PDF generation), Vitest.


---


## Phase 3: Family-Centric & Community (3-4 weeks)


### Task 1: Family Profile Extensions


**Files:**
- Modify: `lib/firestore.ts` — extend UserProfile interface
- Modify: `app/profile/create/page.tsx` — add "Who is this for?" step
- Create: `components/FamilyBadge.tsx` — "Created by Father" badge


- [ ] **Step 1: Extend UserProfile interface**


Add to `lib/firestore.ts`:
```typescript
// Add to UserProfile interface
profileCreatedBy?: "self" | "parent" | "guardian" | "sibling";
creatorRelation?: string;
familyMembers?: string[];
familyValues?: string[];
numberOfSiblings?: number;
fatherOccupation?: string;
motherOccupation?: string;
familyIncome?: string;
```


- [ ] **Step 2: Add "Who is this profile for?" to signup flow**


First screen in profile creation asks:
- Self / Son / Daughter / Sibling / Other
- Sets `profileCreatedBy` and `creatorRelation`


- [ ] **Step 3: Create FamilyBadge component**


```typescript
// components/FamilyBadge.tsx
"use client";
interface FamilyBadgeProps { createdBy?: string; relation?: string; }
export default function FamilyBadge({ createdBy, relation }: FamilyBadgeProps) {
  if (!createdBy || createdBy === "self") return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">
      Created by {relation || createdBy}
    </span>
  );
}
```


- [ ] **Step 4: Commit**


```bash
git commit -m "feat: add family profile creation (created by parent/guardian)"
```


---


### Task 2: Privacy Controls


**Files:**
- Create: `lib/privacy.ts` — privacy settings types and defaults
- Create: `app/settings/privacy/page.tsx` — privacy settings page
- Create: `app/api/settings/privacy/route.ts` — save/load privacy settings


- [ ] **Step 1: Define privacy settings types**


```typescript
// lib/privacy.ts
export interface PrivacySettings {
  profileVisibility: "everyone" | "premium_only" | "community_only";
  photoVisibility: "show_all" | "blur_until_match" | "hide";
  contactVisibility: "premium_viewers" | "matched_only" | "hidden";
  whoCanMessage: "anyone" | "matched_only" | "community_only";
  showOnlineStatus: boolean;
  showLastActive: boolean;
  showProfileTo: "everyone" | "same_religion" | "same_community";
}


export const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: "everyone",
  photoVisibility: "show_all",
  contactVisibility: "premium_viewers",
  whoCanMessage: "anyone",
  showOnlineStatus: true,
  showLastActive: true,
  showProfileTo: "everyone",
};
```


- [ ] **Step 2: Create privacy settings page and API route**
- [ ] **Step 3: Enforce privacy in API routes (matches, recommendations)**
- [ ] **Step 4: Commit**


---


### Task 3: Community Groups & Gotra Matching


**Files:**
- Create: `lib/community.ts` — community CRUD
- Create: `app/community/page.tsx` — community feed
- Modify: `lib/matching.ts` — add community-specific weights


- [ ] **Step 1: Create community data model and auto-assignment**
- [ ] **Step 2: Add community feed page (same-community profiles only)**
- [ ] **Step 3: Add gotra warning in match results**
- [ ] **Step 4: Commit**


---


### Task 4: WhatsApp Integration (Share & Notifications)


**Files:**
- Create: `lib/whatsapp.ts` — WhatsApp message templates
- Create: `app/api/notifications/whatsapp/route.ts` — send WhatsApp notifications
- Add: "Share via WhatsApp" button on profile cards


- [ ] **Step 1: Create WhatsApp notification module**
- [ ] **Step 2: Add share-via-WhatsApp button**
- [ ] **Step 3: Add WhatsApp notification preference in settings**
- [ ] **Step 4: Commit**


---


## Phase 4: AI-Powered Features (3-4 weeks)


### Task 5: AI Bio Writer


**Files:**
- Create: `app/api/ai/generate-bio/route.ts`
- Create: `components/AiBioWriter.tsx` — modal with generated options
- Modify: `app/profile/create/page.tsx` — add "Help me write" button


- [ ] **Step 1: Create Claude API integration for bio generation**


```typescript
// app/api/ai/generate-bio/route.ts
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, age, occupation, hobbies, lifestyle, familyType, values, language } = body;


  const prompt = `Generate 3 matrimonial profile bios (150 words each) for:
Name: ${name}, Age: ${age}, Occupation: ${occupation}
Hobbies: ${hobbies?.join(", ")}, Lifestyle: ${lifestyle}
Family: ${familyType}, Values: ${values?.join(", ")}


Requirements:
- Tone: Warm, dignified, family-oriented, culturally appropriate for Indian matrimony
- Language: ${language || "English"}
- Avoid: Casual dating language, Western romance tropes
- Include: Family values, professional achievement, future aspirations
- Format: Return as JSON array of 3 strings`;


  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.CLAUDE_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });


  const data = await response.json();
  return NextResponse.json({ bios: data.content[0].text });
}
```


- [ ] **Step 2: Create AiBioWriter modal component**
- [ ] **Step 3: Wire into profile creation page**
- [ ] **Step 4: Commit**


---


### Task 6: AI Icebreakers


**Files:**
- Create: `lib/icebreakers.ts` — template + AI-based icebreaker generation
- Create: `app/api/ai/icebreakers/route.ts`
- Modify: `app/matches/page.tsx` — show suggestions below chat input


- [ ] **Step 1: Create icebreaker generation (template-first, AI fallback)**
- [ ] **Step 2: Display 3 icebreaker suggestions in chat panel**
- [ ] **Step 3: One-tap to insert into message input**
- [ ] **Step 4: Commit**


---


### Task 7: AI Photo Enhancement Suggestions


**Files:**
- Create: `app/api/ai/photo-analysis/route.ts` — analyze photos via Claude Vision
- Modify: `app/profile/create/page.tsx` — show suggestions after upload


- [ ] **Step 1: Create photo analysis API using Claude Vision**
- [ ] **Step 2: Show non-blocking tips after photo upload**
- [ ] **Step 3: Commit**


---


### Task 8: Smart Suggestions Dashboard Cards


**Files:**
- Create: `lib/suggestions.ts` — rule-based profile improvement suggestions
- Create: `components/SuggestionCard.tsx` — dismissible suggestion card
- Modify: `app/dashboard/page.tsx` — show 2-3 suggestion cards


- [ ] **Step 1: Implement rule-based suggestions**


```typescript
// lib/suggestions.ts
import { UserProfile } from "./firestore";


export interface Suggestion {
  id: string;
  title: string;
  body: string;
  action?: string;
  actionUrl?: string;
  priority: number;
}


export function getProfileSuggestions(profile: UserProfile): Suggestion[] {
  const suggestions: Suggestion[] = [];


  if (!profile.photoURL && (!profile.photos || profile.photos.length === 0)) {
    suggestions.push({
      id: "add_photo",
      title: "Add a photo",
      body: "Profiles with photos get 5x more responses",
      action: "Add Photo",
      actionUrl: "/profile/create",
      priority: 1,
    });
  }


  if (!profile.hobbies || profile.hobbies.length === 0) {
    suggestions.push({
      id: "add_hobbies",
      title: "Add your hobbies",
      body: "Shared interests improve compatibility scores by 15%",
      action: "Add Hobbies",
      actionUrl: "/profile/create",
      priority: 2,
    });
  }


  if (!profile.bio || profile.bio.length < 50) {
    suggestions.push({
      id: "improve_bio",
      title: "Write a longer bio",
      body: "Longer bios get 2x more interest from families",
      action: "Edit Bio",
      actionUrl: "/profile/create",
      priority: 3,
    });
  }


  if (!profile.aboutFamily) {
    suggestions.push({
      id: "add_family",
      title: "Add family details",
      body: "80% of families check this section first",
      action: "Add Details",
      actionUrl: "/profile/create",
      priority: 4,
    });
  }


  return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
}
```


- [ ] **Step 2: Create SuggestionCard component**
- [ ] **Step 3: Show on dashboard**
- [ ] **Step 4: Commit**


---


## Phase 5: Communication & Social (4-6 weeks)


### Task 9: Push Notifications (FCM)


**Files:**
- Create: `public/firebase-messaging-sw.js` — service worker
- Create: `lib/push-notifications.ts` — request permission + get token
- Create: `app/api/notifications/push/route.ts` — send push via Admin SDK
- Modify: `lib/firestore.ts` — add `fcmToken` to UserProfile


- [ ] **Step 1: Set up Firebase Cloud Messaging service worker**
- [ ] **Step 2: Request notification permission on first login**
- [ ] **Step 3: Store FCM token in user profile**
- [ ] **Step 4: Send push on interest/message/match events**
- [ ] **Step 5: Commit**


---


### Task 10: Video/Voice Calls (Twilio)


**Files:**
- Create: `lib/calls.ts` — call session management
- Create: `app/api/calls/token/route.ts` — generate Twilio access token
- Create: `app/api/calls/route.ts` — create/end call
- Create: `components/CallUI.tsx` — in-call interface
- Create: `components/IncomingCall.tsx` — incoming call overlay


- [ ] **Step 1: Install Twilio SDK, create token generation API**
- [ ] **Step 2: Create call data model in Firestore**
- [ ] **Step 3: Build CallUI component (mute, camera toggle, end)**
- [ ] **Step 4: Build IncomingCall overlay with accept/decline**
- [ ] **Step 5: Wire call buttons into chat header**
- [ ] **Step 6: Commit**


---


### Task 11: Scheduled Meetings


**Files:**
- Create: `lib/meetings.ts` — meeting CRUD
- Create: `app/api/meetings/route.ts`
- Create: `components/ProposeMeeting.tsx` — meeting proposal form


- [ ] **Step 1: Create meeting data model and API**
- [ ] **Step 2: Create ProposeMeeting component with calendar picker**
- [ ] **Step 3: Show meeting notifications and accept/decline**
- [ ] **Step 4: Commit**


---


### Task 12: Community Forums


**Files:**
- Create: `lib/forum.ts` — posts and comments CRUD
- Create: `app/forum/page.tsx` — forum listing
- Create: `app/forum/[postId]/page.tsx` — single post with comments
- Create: `app/api/forum/route.ts` — forum API


- [ ] **Step 1: Create forum data model (posts + comments)**
- [ ] **Step 2: Build forum listing page with categories**
- [ ] **Step 3: Build post detail page with comments**
- [ ] **Step 4: Add moderation (report, admin remove)**
- [ ] **Step 5: Commit**


---


## Phase 6: Verification, Monetization & Scale (4-6 weeks)


### Task 13: Tiered Pricing System


**Files:**
- Modify: `lib/firestore.ts` — add `plan`, `planExpiresAt` fields
- Create: `lib/plans.ts` — plan features and gates
- Create: `app/api/create-subscription/route.ts` — Razorpay subscription
- Modify: `components/PremiumModal.tsx` — show 4 tiers
- Create: `middleware.ts` (extend) — plan-based feature gating


- [ ] **Step 1: Define plan tiers and feature matrix**


```typescript
// lib/plans.ts
export type PlanTier = "free" | "silver" | "gold" | "platinum";


export interface PlanFeatures {
  dailyRecommendations: number;
  interestsPerDay: number;
  messagesPerDay: number;
  seeWhoLiked: "count" | "blurred" | "full";
  viewContactDetails: boolean;
  callsPerMonth: number;
  boostsPerWeek: number;
  familyGroupChat: boolean;
  backgroundCheck: number; // per year
  priorityListing: boolean;
  adFree: boolean;
}


export const PLAN_FEATURES: Record<PlanTier, PlanFeatures> = {
  free: {
    dailyRecommendations: 3, interestsPerDay: 5, messagesPerDay: 3,
    seeWhoLiked: "count", viewContactDetails: false, callsPerMonth: 0,
    boostsPerWeek: 0, familyGroupChat: false, backgroundCheck: 0,
    priorityListing: false, adFree: false,
  },
  silver: {
    dailyRecommendations: 5, interestsPerDay: 15, messagesPerDay: 10,
    seeWhoLiked: "blurred", viewContactDetails: false, callsPerMonth: 0,
    boostsPerWeek: 0, familyGroupChat: false, backgroundCheck: 0,
    priorityListing: false, adFree: true,
  },
  gold: {
    dailyRecommendations: 10, interestsPerDay: 999, messagesPerDay: 999,
    seeWhoLiked: "full", viewContactDetails: true, callsPerMonth: 5,
    boostsPerWeek: 1, familyGroupChat: false, backgroundCheck: 0,
    priorityListing: true, adFree: true,
  },
  platinum: {
    dailyRecommendations: 999, interestsPerDay: 999, messagesPerDay: 999,
    seeWhoLiked: "full", viewContactDetails: true, callsPerMonth: 999,
    boostsPerWeek: 3, familyGroupChat: true, backgroundCheck: 1,
    priorityListing: true, adFree: true,
  },
};


export const PLAN_PRICES = {
  metro: { silver: 499, gold: 999, platinum: 2499 },
  tier34: { silver: 199, gold: 499, platinum: 999 },
};
```


- [ ] **Step 2: Create Razorpay subscription API**
- [ ] **Step 3: Update PremiumModal with 4 tiers**
- [ ] **Step 4: Add plan-based gating in API routes**
- [ ] **Step 5: Commit**


---


### Task 14: Identity Verification (Photo + ID)


**Files:**
- Create: `app/api/verify/photo/route.ts` — selfie verification
- Create: `app/api/verify/id/route.ts` — ID upload + OCR
- Create: `components/VerificationBadges.tsx`
- Create: `app/settings/verification/page.tsx`


- [ ] **Step 1: Create selfie verification (capture + compare)**
- [ ] **Step 2: Create ID verification (upload + OCR via Google Vision)**
- [ ] **Step 3: Create verification badges component**
- [ ] **Step 4: Create verification settings page**
- [ ] **Step 5: Commit**


---


### Task 15: Referral System


**Files:**
- Create: `lib/referrals.ts` — referral code generation and tracking
- Create: `app/api/referrals/route.ts` — create referral, track conversion
- Create: `app/settings/referrals/page.tsx` — referral dashboard


- [ ] **Step 1: Generate unique referral codes per user**
- [ ] **Step 2: Track signups via referral code**
- [ ] **Step 3: Grant premium days on signup and premium conversion**
- [ ] **Step 4: Build referral dashboard with sharing**
- [ ] **Step 5: Commit**


---


### Task 16: Multilingual Support (i18n)


**Files:**
- Install: `next-intl`
- Create: `messages/en.json`, `messages/hi.json` (Hindi)
- Create: `i18n.ts` — configuration
- Modify: `app/layout.tsx` — wrap with IntlProvider
- Create: `components/LanguageSwitcher.tsx`


- [ ] **Step 1: Install and configure next-intl**
- [ ] **Step 2: Extract all UI strings to en.json**
- [ ] **Step 3: Translate to Hindi (hi.json) — culturally adapted**
- [ ] **Step 4: Add language switcher to navbar**
- [ ] **Step 5: Commit**


---


### Task 17: Success Stories


**Files:**
- Create: `app/success-stories/page.tsx` — public listing
- Create: `app/api/success-stories/route.ts` — CRUD
- Modify: `app/page.tsx` (landing) — featured stories carousel


- [ ] **Step 1: Create success story submission form**
- [ ] **Step 2: Create public success stories page**
- [ ] **Step 3: Add featured carousel to landing page**
- [ ] **Step 4: Add admin approval for stories**
- [ ] **Step 5: Commit**


---


## Phase 7: Tier 3-4 City Accessibility (5-7 weeks)


### Task 18: Bharat Mode (Lite/Data Saver)


**Files:**
- Create: `lib/bharat-mode.ts` — detection + feature flags
- Create: `context/BharatModeContext.tsx` — provider
- Create: `components/ProfileListView.tsx` — text-heavy list view
- Modify: `app/layout.tsx` — conditional rendering


- [ ] **Step 1: Create connection speed detection**


```typescript
// lib/bharat-mode.ts
export function detectSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  const conn = (navigator as any).connection;
  if (!conn) return false;
  return conn.effectiveType === "2g" || conn.effectiveType === "slow-2g";
}


export function isBharatMode(): boolean {
  if (typeof window === "undefined") return false;
  const cookie = document.cookie.split(";").find(c => c.trim().startsWith("bharat_mode="));
  if (cookie) return cookie.split("=")[1] === "true";
  return detectSlowConnection();
}
```


- [ ] **Step 2: Create BharatMode context provider**
- [ ] **Step 3: Create ProfileListView (text-only, thumbnails, no animations)**
- [ ] **Step 4: Conditional rendering: list view vs card view based on mode**
- [ ] **Step 5: Add "Data Saver" toggle in settings**
- [ ] **Step 6: Commit**


---


### Task 19: Voice-First Profile Creation


**Files:**
- Create: `lib/voice-input.ts` — Web Speech API wrapper
- Create: `components/VoiceProfileCreator.tsx` — guided voice flow
- Create: `app/api/ai/parse-voice/route.ts` — extract structured data from speech


- [ ] **Step 1: Create Web Speech API wrapper**
- [ ] **Step 2: Build guided voice flow (questions one by one)**
- [ ] **Step 3: Send transcript to Claude for structured data extraction**
- [ ] **Step 4: Pre-fill form from extracted data**
- [ ] **Step 5: Commit**


---


### Task 20: Simplified Onboarding (3-Tap Profile)


**Files:**
- Create: `app/auth/quick-signup/page.tsx` — 3-screen signup
- Modify: `app/auth/signup/page.tsx` — add "Quick Setup" option


- [ ] **Step 1: Create 3-tap signup flow**


Screen 1: Name + Gender + DOB (age) — single form
Screen 2: Religion + City — single form
Screen 3: One photo (camera capture) — single action


- [ ] **Step 2: Immediately show matches after 3-tap**
- [ ] **Step 3: Add progressive completion nudges**
- [ ] **Step 4: Commit**


---


### Task 21: UPI-First Payment


**Files:**
- Modify: `app/api/create-order/route.ts` — UPI intent + QR code options
- Modify: `components/PremiumModal.tsx` — UPI-first payment flow
- Create: `lib/location-pricing.ts` — tier-based pricing


- [ ] **Step 1: Create location-based pricing logic**
- [ ] **Step 2: Configure Razorpay for UPI Intent as primary method**
- [ ] **Step 3: Add QR code display as alternative**
- [ ] **Step 4: Update payment UI to show UPI first, cards last**
- [ ] **Step 5: Commit**


---


### Task 22: SMS Notifications


**Files:**
- Create: `lib/sms.ts` — MSG91 integration
- Create: `app/api/notifications/sms/route.ts` — send SMS
- Add: SMS notification preference in settings


- [ ] **Step 1: Create MSG91 SMS module**
- [ ] **Step 2: Create notification templates in Hindi**
- [ ] **Step 3: Send SMS on key events (match, message, approval)**
- [ ] **Step 4: Add DND compliance check**
- [ ] **Step 5: Commit**


---


## Phase 8: Competitive Moat (4-6 weeks)


### Task 23: AI Compatibility Narrative


**Files:**
- Create: `app/api/ai/compatibility-narrative/route.ts`
- Modify: matches page — show narrative on profile view


- [ ] **Step 1: Create Claude prompt for compatibility storytelling**
- [ ] **Step 2: Generate narrative in user's preferred language**
- [ ] **Step 3: Cache generated narratives per profile pair**
- [ ] **Step 4: Display below compatibility badge on profile view**
- [ ] **Step 5: Commit**


---


### Task 24: Biodata Generator (PDF)


**Files:**
- Install: `@react-pdf/renderer`
- Create: `lib/biodata-templates.ts` — 4 template definitions
- Create: `app/api/biodata/[uid]/route.ts` — generate PDF
- Create: `app/profile/biodata/page.tsx` — template picker + download


- [ ] **Step 1: Install @react-pdf/renderer**
- [ ] **Step 2: Create Traditional template (religion header + bordered frame)**
- [ ] **Step 3: Create Modern and Simple templates**
- [ ] **Step 4: Create API route that generates PDF from profile data**
- [ ] **Step 5: Create biodata page with template picker and download**
- [ ] **Step 6: Add "Share as Image via WhatsApp" option**
- [ ] **Step 7: Commit**


---


### Task 25: Community Trust Score & Vouch System


**Files:**
- Create: `lib/trust-score.ts` — composite score calculation
- Create: `lib/trust-score.test.ts` — unit tests
- Create: `app/api/vouch/route.ts` — vouch for a user
- Create: `components/TrustBadge.tsx` — star-based display


- [ ] **Step 1: Write tests for trust score calculation**


```typescript
// lib/trust-score.test.ts
import { describe, it, expect } from "vitest";
import { calculateTrustScore, TrustScoreInput } from "./trust-score";


describe("calculateTrustScore", () => {
  it("returns 10 for a bare minimum profile (completeness only)", () => {
    const input: TrustScoreInput = {
      profileComplete: true, photoVerified: false, idVerified: false,
      communityVouches: 0, matchmakerEndorsed: false,
      familyEndorsed: false, responseRate: 0, accountAgeDays: 0,
      socialPledges: 0,
    };
    expect(calculateTrustScore(input)).toBe(10);
  });


  it("returns 100 for a fully verified, highly vouched profile", () => {
    const input: TrustScoreInput = {
      profileComplete: true, photoVerified: true, idVerified: true,
      communityVouches: 5, matchmakerEndorsed: true,
      familyEndorsed: true, responseRate: 1.0, accountAgeDays: 365,
      socialPledges: 3,
    };
    expect(calculateTrustScore(input)).toBe(100);
  });
});
```


- [ ] **Step 2: Implement trust score calculation**


```typescript
// lib/trust-score.ts
export interface TrustScoreInput {
  profileComplete: boolean;
  photoVerified: boolean;
  idVerified: boolean;
  communityVouches: number; // max 5
  matchmakerEndorsed: boolean;
  familyEndorsed: boolean;
  responseRate: number; // 0.0 - 1.0
  accountAgeDays: number;
  socialPledges: number; // count of pledges taken
}


export function calculateTrustScore(input: TrustScoreInput): number {
  let score = 0;


  // Profile completeness (10%)
  if (input.profileComplete) score += 10;


  // Photo verified (10%)
  if (input.photoVerified) score += 10;


  // ID verified (10%)
  if (input.idVerified) score += 10;


  // Community vouches (25%) — 5% per vouch, max 5
  score += Math.min(input.communityVouches, 5) * 5;


  // Matchmaker endorsement (15%)
  if (input.matchmakerEndorsed) score += 15;


  // Family endorsement (10%)
  if (input.familyEndorsed) score += 10;


  // Response rate (10%) — proportional
  score += Math.round(Math.min(input.responseRate, 1.0) * 10);


  // Account age (5%) — max at 365 days
  score += Math.min(Math.round((input.accountAgeDays / 365) * 5), 5);


  // Social pledges (5%) — ~1.7% per pledge, max 3
  score += Math.min(input.socialPledges, 3) * Math.round(5 / 3);


  return Math.min(score, 100);
}


export function getTrustStars(score: number): number {
  if (score >= 81) return 5;
  if (score >= 61) return 4;
  if (score >= 41) return 3;
  if (score >= 21) return 2;
  return 1;
}
```


- [ ] **Step 3: Create vouch API and TrustBadge component**
- [ ] **Step 4: Display trust score on profiles**
- [ ] **Step 5: Commit**


---


### Task 26: Family Introduction Protocol (6-Stage)


**Files:**
- Create: `lib/introductions.ts` — stage management
- Create: `app/introductions/page.tsx` — active introductions list
- Create: `app/introductions/[id]/page.tsx` — stage detail + actions
- Create: `app/api/introductions/route.ts` — create/advance/decline


- [ ] **Step 1: Create introduction data model**
- [ ] **Step 2: Create API route for stage transitions**
- [ ] **Step 3: Build introductions page with progress bars**
- [ ] **Step 4: Stage-appropriate actions (accept, decline, propose meeting)**
- [ ] **Step 5: Commit**


---


### Task 27: Dowry-Free Pledge & Social Impact Badges


**Files:**
- Modify: `lib/firestore.ts` — add `pledges` field
- Create: `components/PledgeBadge.tsx`
- Modify: `app/profile/create/page.tsx` — add pledge checkboxes
- Create: `components/PledgeShareCard.tsx` — shareable social card


- [ ] **Step 1: Add pledge data to profile**
- [ ] **Step 2: Create PledgeBadge component (no-dowry, equal-education, etc.)**
- [ ] **Step 3: Add pledge options in profile creation**
- [ ] **Step 4: Create shareable social card for WhatsApp/social media**
- [ ] **Step 5: Commit**


---


## Phase 9: Offline-to-Online Bridge (3-5 weeks)


### Task 28: QR Code Profile System


**Files:**
- Install: `qrcode`
- Create: `lib/qrcode.ts` — QR generation
- Create: `app/p/[shortId]/page.tsx` — public profile page (limited info)
- Create: `app/api/qr/route.ts` — generate QR image
- Modify: `app/dashboard/page.tsx` — "Download QR" button


- [ ] **Step 1: Install qrcode package**
- [ ] **Step 2: Create QR generation utility**
- [ ] **Step 3: Create public profile page at /p/[shortId]**
- [ ] **Step 4: Add QR download button to dashboard**
- [ ] **Step 5: Commit**


---


### Task 29: WhatsApp Bot (Full Interface)


**Files:**
- Create: `app/api/whatsapp/webhook/route.ts` — WhatsApp webhook handler
- Create: `lib/whatsapp-bot.ts` — conversation state machine
- Create: Firestore collection: `whatsapp_sessions/{phone}`


- [ ] **Step 1: Create webhook endpoint for WhatsApp Business API**
- [ ] **Step 2: Create conversation state machine**


```typescript
// lib/whatsapp-bot.ts
export type BotState = "onboarding" | "browsing" | "chatting" | "creating_profile";


export interface WhatsAppSession {
  userId?: string;
  state: BotState;
  context: Record<string, any>;
  language: string;
  lastMessageAt: Date;
}


export function getResponse(session: WhatsAppSession, message: string): { text: string; newState?: BotState } {
  const msg = message.toLowerCase().trim();


  if (session.state === "onboarding") {
    if (msg === "1" || msg.includes("hindi")) return { text: "Namaste! Aapka swagat hai. Profile banana hai to 1 bhejein. Rishte dekhne ke liye 2 bhejein.", newState: "browsing" };
    return { text: "Welcome! Send 1 to create profile, 2 to browse matches." };
  }


  if (msg.includes("rishte") || msg.includes("matches") || msg === "2") {
    return { text: "Aapke liye aaj ke top 5 rishte...", newState: "browsing" };
  }


  if (msg.includes("profile") || msg === "1") {
    return { text: "Profile banana shuru karein. Aapka naam kya hai?", newState: "creating_profile" };
  }


  return { text: "Main samajh nahi paaya. Kripya 1 (profile), 2 (rishte), ya HELP bhejein." };
}
```


- [ ] **Step 3: Handle profile creation via WhatsApp conversation**
- [ ] **Step 4: Send daily recommendations as WhatsApp profile cards**
- [ ] **Step 5: Commit**


---


### Task 30: Printable Biodata Booklets


**Files:**
- Create: `app/api/booklet/[uid]/route.ts` — generate PDF booklet
- Create: `app/profile/booklet/page.tsx` — booklet preview + download


- [ ] **Step 1: Create booklet generation (cover + 15 compatible profiles)**
- [ ] **Step 2: Each page: photo + key details + QR + compatibility**
- [ ] **Step 3: Build preview page with download button**
- [ ] **Step 4: Commit**


---


### Task 31: IVR System Integration


**Files:**
- Create: `app/api/ivr/webhook/route.ts` — Exotel webhook
- Create: `lib/ivr.ts` — IVR state machine and TTS templates


- [ ] **Step 1: Create Exotel IVR webhook endpoint**
- [ ] **Step 2: Define IVR flow (menu → browse → interact)**
- [ ] **Step 3: Create Hindi TTS templates for profile descriptions**
- [ ] **Step 4: Handle missed-call verification flow**
- [ ] **Step 5: Commit**


---


## Final Integration & Launch Readiness


### Task 32: End-to-End Testing & Polish


- [ ] **Step 1: Run full test suite**


Run: `npx vitest run`
Expected: All unit tests pass


- [ ] **Step 2: Run TypeScript check**


Run: `npx tsc --noEmit`
Expected: No type errors


- [ ] **Step 3: Run production build**


Run: `npx next build`
Expected: Build succeeds, no warnings


- [ ] **Step 4: Manual smoke test checklist**
- Signup → Profile creation → Dashboard
- Match browsing (For You + Browse tabs)
- Express interest → Mutual match notification
- Send message → Chat panel works
- Premium upgrade flow
- Admin panel (approve/reject/reports)
- Block/report flow
- Settings (privacy, notifications)


- [ ] **Step 5: Final commit and tag**


```bash
git tag v1.0.0-beta
```


---


## Summary


| Phase | Key Deliverables | Estimated Duration |
|-------|-----------------|-------------------|
| Phase 3 | Family profiles, privacy controls, community groups, WhatsApp share | 3-4 weeks |
| Phase 4 | AI bio writer, icebreakers, photo tips, smart suggestions | 3-4 weeks |
| Phase 5 | Push notifications, video calls, meetings, forums | 4-6 weeks |
| Phase 6 | Tiered pricing, verification, referrals, i18n, success stories | 4-6 weeks |
| Phase 7 | Bharat Mode, voice input, 3-tap signup, UPI, SMS | 5-7 weeks |
| Phase 8 | AI narratives, biodata PDF, trust score, 6-stage protocol, pledges | 4-6 weeks |
| Phase 9 | QR codes, WhatsApp bot, booklets, IVR | 3-5 weeks |


**Total: ~26-40 weeks (6-10 months) for all remaining phases**


Each phase is independently deployable and adds immediate user value.

