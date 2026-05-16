# CLAUDE.md


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.


@AGENTS.md


## Commands


```bash
npm install          # Install dependencies
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```


No test framework is configured. No single-test runner available.


## Architecture


This is a **Next.js 16 (App Router)** matrimonial SaaS platform using TypeScript, Firebase, and Razorpay.


### Data Flow


```
Client Components → Firebase Client SDK (real-time subscriptions for chat/notifications)
Client Components → Server Actions (image upload via app/actions/cloudinary.ts)
API Routes → Firebase Admin SDK (payment webhook verification, server-side writes)
```


- **Authentication** is handled entirely client-side via `context/AuthContext.tsx`, which wraps the app in a provider. It supports email/password, Google OAuth, and phone OTP (with reCAPTCHA). On first auth, it auto-creates a Firestore user profile stub.
- **Real-time data** (chat messages, notifications, chat sessions) uses Firestore `onSnapshot` subscriptions directly from client components — NOT through API routes.
- **Mutations that need validation** (payment processing) go through `app/api/` routes using Firebase Admin SDK.


### Key Modules


| Module | Purpose |
|--------|---------|
| `lib/firebase.ts` | Client SDK init (auth, db, storage, googleProvider) |
| `lib/firebase-admin.ts` | Admin SDK init (lazy proxy pattern for adminDb) |
| `lib/firestore.ts` | User profile CRUD, `UserProfile` interface definition, `getApprovedProfiles()` |
| `lib/chat.ts` | Chat sessions + messages with 3-message limit enforcement in "pending" status |
| `lib/notifications.ts` | Notification CRUD with real-time subscriptions and batch mark-all-read |
| `lib/analytics.ts` | Interaction logging (swipe events, profile views, time spent) |
| `lib/cloudinary.ts` | Image upload with 1000x1000 max transform |
| `context/AuthContext.tsx` | Global auth state, exposes signUp/signIn/signInWithGoogle/phone OTP methods |


### Firestore Collections


- `users/{uid}` — User profiles (status: pending/approved/rejected, is_premium flag)
- `chat_sessions/{sessionId}` — Two-participant sessions with message count tracking
- `chat_sessions/{sessionId}/messages/{msgId}` — Individual messages (subcollection)
- `notifications/{notifId}` — User notifications (interest, message, match, system types)
- `user_interactions/{id}` — Analytics events (swipe_left, swipe_right, profile_view, etc.)


### Payment Flow


1. Client calls `POST /api/create-order` → creates Razorpay order (₹999 = 99900 paise)
2. Razorpay checkout opens in browser with user's uid in `notes`
3. On capture, Razorpay sends webhook to `POST /api/razorpay-webhook`
4. Webhook verifies HMAC-SHA256 signature, then sets `is_premium: true` on user doc


### Design System


"Heritage Curator" aesthetic defined in `app/globals.css`:
- Primary: `#f97316` (orange/saffron), Secondary: `#800000` (maroon)
- Background: `#fff9f0` (cream), Text: `#3A2D27` (dark brown)
- Custom utilities: `.gold-gradient`, `.glass` (glassmorphism), `.shadow-ambient`, `.blur-contact`
- Typography: Montserrat (body) + serif via `font-serif` class (headings)
- All interactive elements use `gold-gradient` with `rounded-full` or `rounded-2xl`


### Path Alias


`@/*` maps to project root (configured in tsconfig.json). Use `@/lib/firebase`, `@/components/Navbar`, etc.


### Important Patterns


- Profile approval is a manual process — no admin panel exists yet. Profiles start as `status: "pending"`.
- Chat has a **3-message limit** per participant in "pending" sessions. Premium users bypass limits.
- Contact details (phone, email) are hidden from non-premium users via CSS blur + conditional rendering.
- Image uploads go through a server action (`app/actions/cloudinary.ts`) to keep the API secret server-side.
- Protected pages manually check `user` from AuthContext and redirect to `/auth/login` if null.

