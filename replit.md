# Bizento AI

## Overview
AI-powered product photography and creative automation platform (rebranded from PixaLera). Users upload product photos and generate professional catalog images, cinematic ads, and social media creatives using AI.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Radix UI components)
- **Routing**: React Router DOM v6
- **Auth & DB**: Firebase (Auth, Firestore, Realtime DB, Storage, Analytics)
- **State**: TanStack React Query + React Context
- **Forms**: React Hook Form + Zod
- **AI Backend**: Express.js server (`server/`) on port 3001 — proxied via Vite's `/api` proxy

## Project Structure
```
src/
  components/
    app/        # App-specific components (sidebar, navbar, GenerationResults, ImageLightbox, etc.)
    ui/         # shadcn/ui component library
  contexts/     # React contexts (AuthContext, AppContext)
  hooks/        # Custom hooks (useFirestore, useGenerationState, useAdminStats)
  layouts/      # AppLayout, AdminLayout
  lib/          # Firebase config, promptAugmentation, stylePresets, generationApi
  pages/
    website/    # Public marketing pages (Landing, Features, Pricing, Login, Signup)
    app/        # Protected app pages (Dashboard, Catalogs, Ads, Images, etc.)
    admin/      # Admin panel pages (protected by isAdmin role)
server/
  index.js              # Express server entry (port 3001)
  routes/generate.js    # POST /api/generate route
  services/pipeline.js  # Replicate API integration (generateImages, removeBackground, analyzeProduct)
```

## Running the App
- **Dev server** (frontend): `npm run dev` (port 5000, Vite)
- **AI Pipeline server**: `node server/index.js` (port 3001, Express)
- Both run automatically via configured workflows
- Vite proxies all `/api` requests → `localhost:3001`
- **Build**: `npm run build`

## AI Pipeline (Phase 4)
- **`src/lib/stylePresets.ts`** — 6 style presets (Luxury, Marble, Floral, Minimal, Neon, Beach), each with scene prompts, lighting, camera, mood, and per-tool modifiers
- **`src/lib/promptAugmentation.ts`** — Enhanced prompt building with product type detection, style scene prompts, tool-specific language
- **`src/lib/generationApi.ts`** — Frontend API client for `/api/generate` and `/api/health`
- **`src/hooks/useGenerationState.ts`** — Parallel animation + API call; saves real AI images to Firebase Storage; stores metadata in Firestore
- **`server/services/pipeline.js`** — Replicate API calls: `flux-schnell` (image gen), `background-removal`, `llava-13b` (product analysis)

### Enabling Real AI Images
Set the `REPLICATE_API_TOKEN` environment secret. Without it, the system runs in **Preview Mode** — all pipeline steps execute, prompts are augmented, Firestore is updated, but image slots show styled gradient placeholders. The "Add API key for real images" notice appears in the results panel.

### Generation Flow
1. User uploads product image → Firebase Storage (`uploads/{uid}/…`)
2. User enters prompt → frontend calls `POST /api/generate`
3. Server runs: product analysis (LLaVA) + bg removal (Replicate rembg) + scene generation (Flux Schnell)
4. Returns image URLs → frontend uploads them to Firebase Storage (`generated/{uid}/…`)
5. Metadata + image URLs saved to Firestore `generations` collection
6. Admin stats updated (totalGenerations, realImageGenerations, avg generation time)

## Firebase
- Config is in `src/lib/firebase.ts` (project: pixaleraai)
- Auth methods: Email/Password, Google OAuth, Phone OTP
- Google sign-in requires enabling in Firebase Console → Authentication → Sign-in method → Google
- Authorized domains must include the Replit dev domain in Firebase Console → Authentication → Settings

## Authentication Flow
- `AuthContext` handles: Email/Password, Google OAuth (`signInWithGoogle`), Phone OTP, password reset (`sendPasswordReset`)
- `ProtectedRoute` — redirects unauthenticated users to /login
- `AdminRoute` — redirects non-admin users to /app; checks Firestore `users/{uid}.role === "admin"`
- On any new sign-in, `ensureUserDoc()` creates the Firestore user doc if it doesn't exist

## User Profile / Avatar
- `AppContext` exposes `user.photoURL` — sourced from Firestore, falling back to Firebase Auth `photoURL`
- `ProfileMenu` renders `AvatarImage` with `referrerPolicy="no-referrer"` for Google profile pics, falls back to initials

## Admin Panel
- Protected by `AdminRoute` in `App.tsx`
- Set `role: "admin"` in Firestore `users/{uid}` to grant admin access
- Dashboard shows: total users, generations, credits used, Flash/Pro split, real AI image rate, avg generation time, daily bar chart, recent activity feed

## Database Security Rules
- `firestore.rules` — production-ready rules for users, generations, admin, orders (Razorpay-ready), payments
- `database.rules.json` — RTDB rules
- Deploy with: `firebase deploy --only firestore:rules,database`

## Payment (Razorpay — upcoming)
- Firestore has `orders` and `payments` collections already in the rules
- Orders are created by authenticated users, verified/updated only by Cloud Functions

## Key Features
- Product photo upload → Firebase Storage
- AI generation pipeline: product analysis + background removal + scene generation
- 6 style presets with per-tool prompt modifiers
- Intelligent prompt augmentation with product type detection
- Credit system with Free / Starter / Pro plans
- Admin panel with real-time analytics, AI success rate, avg generation time
- Generation results with real AI image display + download

## New Features (v2)
- **Inspiration Hub** (`/app/inspiration`): 12 visual style cards with gradient previews, conversion-focused labels, categories (Catalog, Ads, CGI, Fashion, Lifestyle, Minimal)
- **Generation Settings Popup**: Aspect ratio (1:1, 4:5, 16:9, 9:16, 3:2), outputs (1–3), quality (720p/1K Free, 2K/4K Pro locked)
- **Smart Design Suggestion System**: 7-style modal shown before generation (High Conversion Ad, Amazon Best Seller, Premium Brand, Minimal Catalog, Lifestyle Scene, Cinematic CGI, Viral Social)
- **AI Thinking Experience**: 6-step animated flow with typing animation per step
- **Approval System**: Approve/Regenerate buttons after image generation
- **Platform Optimization**: After approval, select platforms (Amazon, Flipkart, Meesho, Myntra, Others). Generates: SEO title, bullet points, description, 5 keywords, attributes, USPs, emotional hook. Free=1 platform, Pro=multiple
- **Sidebar**: "New Generate" (+) button, "Inspiration Hub", "History", "Settings" nav items
- **History Page**: Search, filter by tool, rename/archive/delete per session with dropdown menu
