# Critical Fixes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 6 critical gaps: rename middleware→proxy, create /api/block + /api/report, wire sanitizeText, build InterestButton, create suggestion engine, add FCM service worker.

**Architecture:** API routes use Firebase Admin SDK. Client components use lib/* utilities. No new dependencies needed.

**Tech Stack:** Next.js 16 App Router, TypeScript, Firebase Admin SDK, Firebase Client SDK.

---

## Task 1: Rename middleware.ts → proxy.ts
- [ ] Copy middleware.ts content to proxy.ts (identical content, just renamed)
- [ ] Delete middleware.ts
- [ ] Commit: "fix: rename middleware.ts to proxy.ts for Next.js 16"

## Task 2: Create /api/block and /api/report Routes
- [ ] Create app/api/block/route.ts using Admin SDK (POST: block/unblock, GET: list blocked)
- [ ] Create app/api/report/route.ts using Admin SDK (POST: submit + auto-suspend at 3 reports)
- [ ] Commit: "feat: add /api/block and /api/report server routes with Admin SDK"

## Task 3: Wire sanitizeText Into Profile Save
- [ ] Add sanitize imports to app/profile/create/page.tsx
- [ ] Wrap formData with sanitizeProfileData() before createUserProfile/updateUserProfile call
- [ ] Commit: "fix: wire sanitization into profile save"

## Task 4: Create InterestButton Component
- [ ] Create components/InterestButton.tsx with none/loading/sent/mutual states
- [ ] Commit: "feat: add InterestButton component"

## Task 5: Create Suggestion Engine
- [ ] Create lib/suggestions.ts with 5 rules (photo, bio, hobbies, family, preferences)
- [ ] Create components/SuggestionCard.tsx dismissible card
- [ ] Commit: "feat: add suggestion engine and SuggestionCard"

## Task 6: FCM Service Worker
- [ ] Create public/firebase-messaging-sw.js with background message handler
- [ ] Fill in Firebase config values from .env.local
- [ ] Commit: "feat: add FCM service worker for push notifications"
