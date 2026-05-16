# Izzatdar Parivar - Matrimonial SaaS 🕊️💍


Izzatdar Parivar is a modern, premium Matrimonial Software-as-a-Service (SaaS) platform built with **Next.js**, **Firebase**, and **Razorpay**. It features a highly aesthetic "Heritage Curator" design system (cream and gold), robust matchmaking filters, real-time user profiles, and seamless payment integrations for premium memberships.


## 🚀 Features


- **Authentication System**: Secure signup/login using Email & Password, Google OAuth, and Phone Number (OTP) via Firebase Auth.
- **Premium Design System**: "Heritage Curator" aesthetic utilizing dynamic glassmorphism, Noto Serif typography, and CSS-based ambient lighting.
- **User Dashboard**: Real-time profile completion tracking, status management (Pending/Approved/Rejected), and matchmaking analytics.
- **Matchmaking Engine**: Browse, filter, and discover highly compatible profiles with interactive profile cards.
- **Monetization (Razorpay Integration)**: Fully functional checkout flow allowing users to purchase a "Premium Membership".
- **Privacy Controls**: Free users are restricted from viewing direct contact details (phone, email) until they upgrade.
- **Admin Security**: Webhook-based server-side payment verification utilizing `firebase-admin` and HMAC signature validation to prevent tampering.


## 🛠 Tech Stack


- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, `clsx`, `tailwind-merge`
- **UI Components**: Shadcn UI (Radix Primitives)
- **Icons**: Lucide React
- **Toast Notifications**: Sonner
- **Backend & Database**: Firebase (Auth, Firestore DB, Storage) & Firebase Admin SDK
- **Payment Gateway**: Razorpay


## ⚙️ Environment Variables


To run this project locally, you must create a `.env.local` file in the root directory and populate it with your specific keys.


```env
# ----- FIREBASE CLIENT SIDE -----
NEXT_PUBLIC_FIREBASE_API_KEY="your_api_key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your_project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your_project.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="your_app_id"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="your_measurement_id"


# ----- FIREBASE ADMIN SDK (SERVER SIDE ONLY) -----
FIREBASE_PROJECT_ID="your_project_id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your_project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour_Key\n-----END PRIVATE KEY-----\n"


# ----- RAZORPAY API KEYS -----
RAZORPAY_API_KEY="rzp_test_your_key"
RAZORPAY_SECRET_KEY="your_test_secret"
RAZORPAY_WEBHOOK_SECRET="your_custom_webhook_secret_string"
```
> **Warning:** NEVER commit your `.env.local` file to public version control. It is ignored by `.gitignore` automatically.


## 💻 Local Development


1. **Install Dependencies:**
   ```bash
   npm install
   ```


2. **Run the Development Server:**
   ```bash
   npm run dev
   ```
   *The server usually runs on `http://localhost:3000` (or `3001` if 3000 is occupied).*


3. **Firebase Pre-requisites:**
   - In your Firebase Console, ensure you have enabled **Firestore Database** and started it in **Test Mode** (`allow read, write: if true;`).
   - Enable **Email/Password**, **Google**, and **Phone** providers under the **Authentication** tab.


## 🌍 Deployment (Vercel)


The easiest way to deploy this application is using the [Vercel Platform](https://vercel.com/new).


1. Ensure the Vercel CLI is installed globally: `npm i -g vercel`.
2. Open the terminal inside your project directory and run:
   ```bash
   vercel
   ```
3. Follow the Prompts (accept the defaults).
4. **Crucial**: After the initial deployment pushes, visit your Vercel Dashboard, go to your project's **Settings > Environment Variables**, and paste in all of your `.env.local` keys!
5. Push the production build with secure keys:
   ```bash
   vercel --prod
   ```


## 💳 Testing Payments
Because the Razorpay keys provided are typically Test Mode keys (`rzp_test_...`), you can use Razorpay's official testing cards during checkout:
- **Card Network**: Visa
- **Card Number**: Use standard test cards provided by the Razorpay dashboard (e.g. any future expiry date, random CVV).
- *Ensure the webhook endpoint in your live Razorpay Dashboard points to `https://your-domain.vercel.app/api/razorpay-webhook` so the database updates properly after payment.*


## 📂 Project Structure


```text
├── app/                  # Next.js App Router (pages, layout, API routes)
│   ├── api/              # Razorpay Webhook & Order Creation handlers
│   ├── auth/             # Login & Signup pages (Phone/Email/Google)
│   ├── dashboard/        # User profile dashboard
│   ├── matches/          # Feed of compatible candidates
│   └── profile/create/   # Multi-step profile setup wizard
├── components/           # Reusable UI elements (Navbar, Modals, Cards)
│   └── ui/               # Shadcn generated atomic primitives
├── context/              # React Context (AuthContext) for global state management
└── lib/                  # Firebase Client/Admin initializers & Firestore models
```



