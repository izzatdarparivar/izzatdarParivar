# Free-Tier Production Remediation & AI Integration Design

## 1. Goal
Remediate all P0/P1 security and performance vulnerabilities identified in the forensic audit, implement a free-tier compatible "serverless microservices" architecture, and integrate the missing AI features (Bio Writer, Icebreakers, Photo Tips, Compatibility Narrative) from the Phase 4 & 8 specs.

## 2. Architecture Strategy (Free-Tier "Microservices")
Instead of expensive Kubernetes clusters, we will leverage Vercel and Firebase free tiers by splitting the monolith into logical serverless boundaries:
*   **Edge Microservices (Vercel Edge Functions):** Handles Auth Middleware, Rate Limiting (Upstash Redis), and JWT Verification. This runs instantly and costs almost nothing.
*   **Data Microservices (Vercel Serverless Functions):** Handles standard CRUD. 
*   **AI/Match Microservices:** Handles heavy compatibility scoring and LLM requests (Gemini Free Tier).
*   **Database (Firebase Spark):** To stay under 50k reads/day, we will denormalize the `blocks` collection to eliminate the N+1 query issue (which currently costs 51 reads per match request).
*   **Caching (Upstash Redis Free):** Cache AI recommendations and Match results (10,000 free requests/day) to shield Firestore.
*   **Storage (Cloudinary Free):** Upload images directly from client to Cloudinary (bypassing the Vercel base64 memory crash).

## 3. Comprehensive Fixes (Audit Report)
### 3.1 Security (P0)
*   **Zod Validation:** Add `zod` schemas to *all* API routes to prevent NoSQL injection.
*   **Rate Limiting:** Implement `@upstash/ratelimit` on all endpoints.
*   **Auth Middleware:** Implement `middleware.ts` to block unauthenticated API access.
*   **Razorpay Webhook:** Add IP allowlisting, idempotency checks (prevent double-upgrades), and HMAC verification.
*   **Session Security:** Move `__session` to `HttpOnly` server-side cookies.
*   **CORS:** Explicitly restrict CORS to production and preview domains.

### 3.2 Stability & Performance (P1)
*   **Race Conditions:** Fix `AuthContext` memory leaks and missing cleanup.
*   **Mock Fallbacks:** Remove dangerous Firebase mock credentials; fail fast on missing env vars.
*   **Indexes:** Add all missing Firestore composite indexes.
*   **Error Boundaries:** Add `error.tsx` and `global-error.tsx` to prevent full-app crashes.

## 4. AI Features Integration
We will integrate a Free Tier LLM (Google Gemini API) to implement the missing AI features:
1.  **AI Bio Writer:** A button in `/profile/create` that takes user's basic traits and generates a culturally appropriate, engaging bio.
2.  **AI Icebreakers:** On match cards, a "Generate Icebreaker" button that reads both profiles and suggests 3 conversation starters.
3.  **AI Photo Enhancement Suggestions:** When a user uploads a photo, simple AI vision check to suggest lighting or framing improvements.
4.  **AI Compatibility Narrative:** Instead of just a % score, provide a 2-sentence AI-generated narrative on *why* two people match (e.g., "Both of you value traditional family setups but enjoy modern outdoor hobbies...").

## 5. UI/UX & Polish
*   **Testing:** Add Vitest unit and integration test suite.
*   **Navigation:** Add sticky bottom nav (mobile) and reduce "Express Interest" clicks from 5 to 2.
*   **Observability:** Integrate Sentry (Free Tier) for error tracking.
*   **Chat:** Implement real-time messaging using Firebase Realtime Database (free for 100 concurrent connections).

## 6. Execution Plan
This design will be executed in the following phases:
1.  **Phase A:** Security & Middleware (Zod, Rate Limiting, Cookies, Webhooks)
2.  **Phase B:** Database Optimization & Caching (Fix N+1, Upstash Redis, Cloudinary)
3.  **Phase C:** AI Features Integration (Bio, Icebreakers, Narratives)
4.  **Phase D:** UI/UX Polish & Testing (Chat, Navigation, Vitest)
