# Clerk & Firebase Auth Integration Design

## 1. Overview
The platform requires a robust OTP authentication system (Email & Phone) that bypasses the limitations of Firebase's free tier. We will migrate the frontend authentication to **Clerk** (which provides a generous allowance for OTPs and excellent UI components) while maintaining **Firestore** as our primary database.

## 2. Architecture: The "Clerk-Firebase Bridge"
We cannot abandon Firebase because all chat, profile, and video calling data structures and security rules depend on a valid Firebase Auth UID (`request.auth.uid`). 

To solve this, we will use a **Custom Token Bridge** pattern:
1. User logs in/signs up via Clerk's `<SignIn />` or `<SignUp />` components using Email or Phone OTP.
2. Clerk issues a session JWT.
3. The client requests a Firebase Custom Token from our Next.js API route.
4. The Next.js API route (using `firebase-admin`) verifies the Clerk session, extracts the user's ID, and generates a Firebase Custom Token for that specific ID.
5. The client receives the Custom Token and calls `signInWithCustomToken(auth, token)`.
6. **Result**: The user is authenticated in both Clerk (for session management) and Firebase (for database access), using the exact same User ID.

## 3. Component Breakdown

### 3.1. Auth Provider (`context/AuthContext.tsx`)
- **Current State**: Uses Firebase Auth directly (`onAuthStateChanged`, `signIn`, etc.).
- **New State**: Will wrap the application in `<ClerkProvider>`. The `AuthContext` will monitor Clerk's `useUser()` state. When a user logs in via Clerk, the context will automatically fetch the Firebase Custom Token and authenticate with Firebase.

### 3.2. Authentication Pages (`app/auth/*`)
- Remove the custom-built Firebase login and register forms.
- Implement Clerk's pre-built `<SignIn />` and `<SignUp />` components.
- Configure Clerk to enforce OTP verification for both Email and Phone numbers.

### 3.3. API Route (`app/api/auth/firebase-token/route.ts`)
- A secure backend endpoint that uses `@clerk/nextjs` to verify the active session.
- Uses `firebase-admin` to call `admin.auth().createCustomToken(clerkUserId)`.

## 4. Required Setup
- **Clerk Dashboard**: Create a Clerk application, enable Email/Phone/Google auth, and configure OTP as the primary verification method.
- **Environment Variables**: Add Clerk public/secret keys. Ensure Firebase Admin SDK keys are properly configured.
- **Dependencies**: Install `@clerk/nextjs` and verify `firebase-admin` is installed.

## 5. Security & Error Handling
- The API route will strictly validate the Clerk session before generating a token.
- Firebase rules remain unchanged, as the custom token will ensure `request.auth.uid` matches the Clerk user ID, keeping all existing authorization logic intact.
