# PixaLera AI

## Overview
AI-powered product photography and marketing visual generation SaaS. Users upload product photos and generate professional catalog images, cinematic ads, and social media creatives using AI (Replicate). Built with React/Vite frontend + Express backend, Firebase Auth/Firestore, and Razorpay payments.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript (port 5000)
- **UI**: Tailwind CSS + shadcn/ui (Radix UI components) + Ant Design (admin)
- **Routing**: React Router DOM v6
- **Auth & DB**: Firebase (Auth, Firestore, Realtime DB, Storage, Analytics)
- **State**: TanStack React Query + React Context
- **Forms**: React Hook Form + Zod
- **AI Backend**: Express.js server (`server/`) on port 3001 — proxied via Vite's `/api` proxy
- **Payments**: Razorpay (create-order + webhook verify) with 18% GST

## Project Structure
```
src/
  components/
    app/        # App-specific components (sidebar, navbar, GenerationResults, UpgradeModal, etc.)
      PhotographyWorkflow.tsx   # PhotoStylePicker + PhotoResult for the Product Photography Tool
      PlatformOptimization.tsx  # Platform-specific SEO optimization (Amazon, Flipkart, Meesho, Myntra, Instagram)
      BrainInsights.tsx         # AI reasoning panel
      SEOPanel.tsx              # SEO copy panel for non-catalog tools
    ui/         # shadcn/ui component library
  contexts/     # React contexts (AuthContext, AppContext)
  hooks/        # Custom hooks (useFirestore, useGenerationState, useAdminStats)
  layouts/      # AppLayout, AdminLayout
  lib/
    firebase.ts         # Firebase config
    firestore.ts        # Firestore schema helpers (transactions, payments, adminLogs, planExpiry)
    generationApi.ts    # API client + Photography types (PhotographyAnalysis, PhotographyBuildResponse, etc.)
    promptAugmentation.ts
    stylePresets.ts
  pages/
    website/    # Public marketing pages (Landing, Features, Pricing, Login, Signup)
    app/        # Protected app pages (Dashboard = WelcomeDashboard.tsx, CheckoutPage, CreditsPage, PlanPage)
    admin/      # Admin panel pages (Users, Logs, Billing, Stats)
server/
  index.js                    # Express server entry (port 3001, ESM)
  middleware/auth.js          # Credit guard: pre-deduct, suspend check, plan expiry, feature gating
  routes/generate.js          # POST /api/generate, /photograph/analyze, /photograph/build-prompt, /chat
  routes/payment.js           # POST /api/payment/create-order + /verify
  routes/admin.js             # Admin CRUD
  routes/notifications.js     # GET /api/notifications + POST/DELETE
  routes/blogs.js             # GET /api/blogs + POST/PATCH/DELETE
  config/firebase.js          # Firebase Admin SDK init
  services/pipeline.js        # Replicate API (flux-schnell, bg-removal, llava-13b) + catalog shot builder
  services/photographyPipeline.js  # Product Photography Tool: 6 styles, backgrounds, lighting, prompt builder
  services/gemini.js          # Gemini AI chat + prompt augmentation (gemini-2.5-flash)
  services/brain.js           # Intent classification (gemini-2.5-flash)
  services/seoGenerator.js    # 5-platform SEO generation (gemini-2.5-flash)
```

## Running the App
- **Dev server** (frontend): `npm run dev` (port 5000, Vite)
- **AI Pipeline server**: `node server/index.js` (port 3001, Express, ESM)
- Both run automatically via configured workflows
- Vite proxies all `/api` requests → `localhost:3001`

## Required Environment Secrets
| Secret | Purpose |
|--------|---------|
| `GEMINI_API_KEY` | Google Gemini AI for chat (primary) — set as env var |
| `REPLICATE_API_TOKEN` | Real AI image generation via Replicate |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin SDK (JSON string) — required for server-side Firestore |
| `RAZORPAY_KEY_ID` | Razorpay payment gateway |
| `RAZORPAY_KEY_SECRET` | Razorpay signature verification |

Without these, the app runs in limited/preview mode with mock responses.

## Plans & Credits
| Plan | Price | Credits | Bonus | Period |
|------|-------|---------|-------|--------|
| Free | ₹0 | 15 | 0 | — |
| Starter | ₹99 | 100 | 20 | 1 month |
| Pro | ₹399 | 450 | 50 | 3 months |

GST (18%) is applied at checkout. Plan expiry auto-downgrades to Free.

## Server-Side Credit Guard (`server/middleware/auth.js`)
- Verifies Firebase Auth token on every `/api/generate` request
- Checks `suspended` flag → 403 if true
- Checks `planExpiry` → auto-downgrades expired plans to free
- Gates Cinematic Ads tool and 4K quality to Pro plan → 403 with `PLAN_REQUIRED` code
- Pre-deducts credits (Firestore transaction) before generation starts
- Auto-refunds credits on generation failure
- Returns `creditsRemaining` in response so frontend syncs without double-deduct

## Payment Flow
1. Frontend calls `POST /api/payment/create-order` with Firebase auth token
2. Backend creates Razorpay order, returns orderId + amount (incl. GST)
3. Frontend opens Razorpay checkout (`CheckoutPage.tsx`)
4. On success, frontend calls `POST /api/payment/verify` with signature
5. Backend verifies signature, updates plan/credits in Firestore, writes payment + transaction records

## Admin Panel
- Protected by `AdminRoute` (checks `users/{uid}.role === "admin"`)
- Admin actions (suspend, credit adjust) call `server/routes/admin.js` with auth token
- All admin actions write to `adminLogs` Firestore collection
- `AdminLogsPage` reads real Firestore logs
- `AdminBillingPage` reads real `payments` collection

## Firebase Security Rules
- `firebase.rules` — comprehensive Firestore rules for all 10+ collections
- `storage.rules` — Storage rules (uploads, generated, bg_removed, public)
- Deploy: `firebase deploy --only firestore:rules,storage`

### Key Rule Decisions
- Users cannot elevate their own `role`, `plan`, `suspended`, or `planExpiry` from client
- Users cannot increase their own `creditsRemaining` from client
- Transactions and adminLogs are immutable (no client update/delete)
- Payments can only be updated by admin SDK (post Razorpay verification)
- `admin/stats` doc is writable by any authenticated user (client updates admin stats)
- Marketing banners are publicly readable (used on landing page)

## AI Pipeline — Brain System

### Master AI Brain Controller (`server/services/brain.js`)
- **Intent Classification**: Gemini AI → keyword fallback → detects intent (chat vs generate)
- **Tool Auto-Selection**: Classifies into catalog / photo / creative / cinematic with confidence score
- **Multi-language**: Detects Hindi/Hinglish naturally, routes replies appropriately
- **Product Detection**: 14 product type patterns (perfume, watch, shoes, jewelry, food, etc.)
- **Response includes**: `brainInsights` object with tool, confidence, reasoning, suggestion, productType, styleRecommendation

### Tool Modules
- **Catalog Generator**: 3 variants — main white-bg, 45° angled, lifestyle scene + SEO listing data
- **Product Photography**: Studio hero, splash/reflection, editorial bokeh variants
- **Ad Creatives**: Instagram, Facebook, poster variants + headline/CTA/hashtag ad copy
- **Cinematic Ads**: CGI environment, particle effects (smoke/water/glow), film color grading (Pro only)

### SEO & Ad Copy Generator (`server/services/seoGenerator.js`)
- **For Catalog/Photography**: SEO title, product description (150-200 words), 5 bullet points, 8 keywords, meta description, attributes
- **For Ads**: Headline, subheadline, CTA, offer hook, body copy, platform-specific copy (Instagram/Facebook), 5 hashtags
- Primary via Gemini → OpenAI fallback → static fallback

### Smart Prompt System
- `getToolVariantPrompts()` — generates 3 distinct prompt variants per tool (main, variant B, variant C)
- Per-tool system prompts for OpenAI prompt augmentation
- Style-scene map for 6 presets (luxury, marble, floral, minimal, neon, beach)
- Quality suffix + model suffix applied to all prompts

### Pipeline Service (`server/services/pipeline.js`)
- **Retry logic**: 2 retries with 1.5x exponential backoff for all Replicate calls
- **Aspect ratio**: Passed through to Flux Schnell model
- **Image analysis**: Extracts colors, material, description via LLaVA-13B

### Frontend Components
- **`BrainInsights.tsx`**: Shows AI tool selection, confidence bar, reasoning, product type, suggestion
- **`SEOPanel.tsx`**: Displays SEO/ad copy with copy buttons, per-field, organized by tool type
- **`GenerationLoading.tsx`**: Tool-specific loading steps (6 steps per tool)
- **`WelcomeDashboard.tsx`**: Dynamic thinking steps per tool, shows BrainInsights + SEOPanel after results

### General Settings
- **Models**: Flash (base cost), Pro (higher cost)
- **Quality**: 720p/1K (Free), 2K (Starter+, +4 credits), 4K (Pro only, +8 credits)
- **Style Presets**: Luxury, Marble, Floral, Minimal, Neon, Beach
- **Gemini AI** (primary): `gemini-2.0-flash` for chat + brain + SEO
- **Replit AI** (fallback): via `AI_INTEGRATIONS_OPENAI_API_KEY`
- **Aspect Ratios**: 1:1, 4:5, 16:9, 9:16, 3:2

## Catalog Attributes
When generating catalog images, Replit AI extracts product attributes from the user's prompt:
- Product Name, Category, Color, Material, Dimensions, Weight, Features, Target Audience, Mood, Style
- Saved to Firestore `generations` collection under `catalogAttributes` field
- Displayed as a collapsible table in `CatalogsPage.tsx`

## AI Routes
- `POST /api/ai-test/prompt` — Test Replit AI with any prompt
- `POST /api/ai-test/prompt/stream` — Streaming AI response (SSE)
- `GET /api/ai-test/health` — Check Replit AI integration status
- `POST /api/generate/chat` — Conversational AI reply (no auth required, free)

## Double-Deduction Prevention
Server pre-deducts credits and returns `creditsRemaining` in response. Frontend's `addGeneration()` skips `updateCredits()` when `apiResp.creditsRemaining` is defined (`serverDeducted` flag).

## Error Codes (from `/api/generate`)
| Code | Meaning | UI Action |
|------|---------|-----------|
| `INSUFFICIENT_CREDITS` | Not enough credits | Show upgrade modal |
| `USER_SUSPENDED` | Account suspended | Show error toast |
| `PLAN_REQUIRED` | Feature needs higher plan | Show upgrade modal |
| `GENERATION_FAILED` | Replicate error | Show retry toast |

## Authentication Flow
- `AuthContext`: Email/Password, Google OAuth, Phone OTP, password reset
- `ProtectedRoute` — redirects unauthenticated → /login
- `AdminRoute` — redirects non-admin → /app
- `ensureUserDoc()` creates Firestore user doc on first sign-in (role: "user", plan: "free", credits: 15)
