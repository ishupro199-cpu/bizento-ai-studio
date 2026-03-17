# PixaLera AI

## Overview
AI-powered product photography and creative automation platform. Users upload product photos and generate professional catalog images, cinematic ads, and social media creatives using AI.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Radix UI components)
- **Routing**: React Router DOM v6
- **Auth & DB**: Firebase (Auth, Firestore, Realtime DB, Storage, Analytics)
- **State**: TanStack React Query + React Context
- **Forms**: React Hook Form + Zod

## Project Structure
```
src/
  components/
    app/        # App-specific components (sidebar, navbar, prompt bar, ProfileMenu, etc.)
    ui/         # shadcn/ui component library
  contexts/     # React contexts (AuthContext, AppContext)
  hooks/        # Custom hooks (useFirestore, useGenerationState, admin stats)
  layouts/      # AppLayout, AdminLayout
  lib/          # Firebase config, utilities, prompt augmentation
  pages/
    website/    # Public marketing pages (Landing, Features, Pricing, Login, Signup)
    app/        # Protected app pages (Dashboard, Catalogs, Ads, Images, etc.)
    admin/      # Admin panel pages (protected by isAdmin role)
```

## Running the App
- **Dev server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`

## Firebase
- Config is in `src/lib/firebase.ts` (project: pixaleraai)
- Auth methods: Email/Password, Google OAuth, Phone OTP
- Google sign-in requires enabling in Firebase Console → Authentication → Sign-in method → Google
- Authorized domains must include the Replit dev domain in Firebase Console → Authentication → Settings

## Authentication Flow
- `AuthContext` handles: Email/Password, Google OAuth (`signInWithGoogle`), Phone OTP, password reset (`sendPasswordReset`)
- `ProtectedRoute` — redirects unauthenticated users to /login
- `AdminRoute` — redirects non-admin users to /app; checks Firestore `users/{uid}.role === "admin"`
- On any new sign-in (Google, phone, email), `ensureUserDoc()` creates the Firestore user doc if it doesn't exist, merges `photoURL` and `displayName` from the provider

## User Profile / Avatar
- `AppContext` exposes `user.photoURL` — sourced from Firestore `users/{uid}.photoURL`, falling back to Firebase Auth `photoURL`
- `ProfileMenu` renders `AvatarImage` with the user's photo URL (with `referrerPolicy="no-referrer"` for Google profile pics), falling back to initials

## Admin Panel
- Protected by `AdminRoute` in `App.tsx`
- Set `role: "admin"` in Firestore `users/{uid}` document to grant admin access
- Admin can see all users, analytics, moderation, system status

## Database Security Rules
- `firestore.rules` — production-ready rules for users, generations, admin, orders (Razorpay-ready), payments
- `database.rules.json` — RTDB rules
- Deploy with: `firebase deploy --only firestore:rules,database`

## Payment (Razorpay — upcoming)
- Firestore has `orders` and `payments` collections already in the rules
- Orders are created by authenticated users, verified/updated only by Cloud Functions

## Key Features
- Product photo upload and AI generation (Flash + Pro models)
- Catalog image generation, cinematic ad creation, ad creative generation
- Prompt library with augmentation
- Credit system with Free / Starter / Pro plans
- Admin panel with user management, analytics, moderation
