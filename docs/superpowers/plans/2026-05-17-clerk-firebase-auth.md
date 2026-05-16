# Clerk & Firebase Auth Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate frontend authentication to Clerk for OTP support while maintaining backend Firebase access via a custom token bridge.

**Architecture:** Use Clerk for frontend session management, and a Next.js API route using `firebase-admin` to issue a Firebase Custom Token. The frontend uses `signInWithCustomToken` to silently log into Firebase.

**Tech Stack:** Next.js, Clerk, Firebase Client SDK, Firebase Admin SDK.

---

### Task 1: Environment and Dependencies

**Files:**
- Modify: `.env.local`
- Modify: `package.json`

- [ ] **Step 1: Install Dependencies**
```bash
npm install @clerk/nextjs firebase-admin
```

- [ ] **Step 2: Add Keys to .env.local**
Update `.env.local` to include the Clerk keys provided.

```env
# ─── Clerk Auth ───────────────────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_dGlkeS1hbGllbi00Ni5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_nV3rmpobZHsqdV7vvIZ7sMHkV9uqC5NtxrIPVW6ix5
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/signup
```

- [ ] **Step 3: Commit**
```bash
git add .env.local package.json package-lock.json
git commit -m "chore: add clerk and firebase-admin dependencies"
```

### Task 2: Setup Clerk Middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Create Middleware File**
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/auth(.*)', '/', '/api/auth/firebase-token']);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) auth().protect();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

- [ ] **Step 2: Commit**
```bash
git add middleware.ts
git commit -m "feat: setup clerk middleware"
```

### Task 3: Setup Firebase Admin SDK

**Files:**
- Create: `lib/firebase-admin.ts`

- [ ] **Step 1: Create Admin SDK Initialization**
```typescript
import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Handle escaped newlines in the private key
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const adminAuth = admin.auth();
```

- [ ] **Step 2: Commit**
```bash
git add lib/firebase-admin.ts
git commit -m "feat: initialize firebase admin sdk"
```

### Task 4: Create Firebase Custom Token API Route

**Files:**
- Create: `app/api/auth/firebase-token/route.ts`

- [ ] **Step 1: Write API Route**
```typescript
import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

export async function GET() {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Generate custom token for the authenticated Clerk user
    const firebaseToken = await adminAuth.createCustomToken(userId);

    return NextResponse.json({ token: firebaseToken });
  } catch (error) {
    console.error('Error generating custom token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/auth/firebase-token/route.ts
git commit -m "feat: create firebase custom token endpoint"
```

### Task 5: Refactor AuthContext & RootLayout

**Files:**
- Modify: `app/layout.tsx`
- Modify: `context/AuthContext.tsx`

- [ ] **Step 1: Wrap app in ClerkProvider**
In `app/layout.tsx`, wrap the body content in `<ClerkProvider>`.
```tsx
import { ClerkProvider } from '@clerk/nextjs'
// ... (imports)

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        {/* existing body content */}
      </html>
    </ClerkProvider>
  )
}
```

- [ ] **Step 2: Update AuthContext to Bridge Authentication**
In `context/AuthContext.tsx`, clear out the old functions (signIn, register, setupRecaptcha) as Clerk handles them now, and just provide the user state:
```tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth as useClerkAuth, useUser } from '@clerk/nextjs';
import { signInWithCustomToken } from 'firebase/auth';
import { auth as firebaseAuth } from '@/lib/firebase';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, userId } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function syncFirebaseAuth() {
      if (!isLoaded) return;
      
      if (!userId) {
        await firebaseAuth.signOut();
        setFirebaseUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/firebase-token');
        const data = await response.json();
        
        if (data.token) {
          const userCredential = await signInWithCustomToken(firebaseAuth, data.token);
          setFirebaseUser(userCredential.user);
        }
      } catch (error) {
        console.error('Failed to sync Firebase auth:', error);
      } finally {
        setLoading(false);
      }
    }

    syncFirebaseAuth();
  }, [isLoaded, userId]);

  // Expose the firebaseUser so existing hooks (db access) continue working
  return (
    <AuthContext.Provider value={{ user: firebaseUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/layout.tsx context/AuthContext.tsx
git commit -m "feat: bridge clerk and firebase via custom token in AuthContext"
```

### Task 6: Replace Auth Pages

**Files:**
- Modify: `app/auth/login/page.tsx`
- Modify: `app/auth/signup/page.tsx`

- [ ] **Step 1: Implement Clerk SignIn**
Replace `app/auth/login/page.tsx` content:
```tsx
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <SignIn routing="path" path="/auth/login" signUpUrl="/auth/signup" />
    </div>
  );
}
```

- [ ] **Step 2: Implement Clerk SignUp**
Replace `app/auth/signup/page.tsx` content:
```tsx
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center px-4 py-12">
      <SignUp routing="path" path="/auth/signup" signInUrl="/auth/login" />
    </div>
  );
}
```

- [ ] **Step 3: Commit**
```bash
git add app/auth/login/page.tsx app/auth/signup/page.tsx
git commit -m "feat: implement clerk signin and signup components"
```
