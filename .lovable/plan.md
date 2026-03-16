

# Bizento AI — Phase 3: System Logic, Credits, Workflow & Admin Controls

## Overview
Implement the complete product behavior layer — credits system, pricing plans, generation workflow with history tracking, image routing to libraries, upgrade modals, and a full admin panel with analytics. All simulated with local state (no backend).

---

## 1. Global App Context (`src/contexts/AppContext.tsx`)
Create a React context to hold the entire app state, shared across all pages:

```text
AppContext
├── user: { name, email, plan, creditsRemaining, creditsUsed, monthlyLimit }
├── selectedModel: "flash" | "pro"
├── setSelectedModel (with upgrade gate for Free plan)
├── generations: GenerationRecord[] (history log)
├── addGeneration(record) — deducts credits, routes image to correct library
├── deleteGeneration(id)
├── catalogs: GenerationRecord[] (filtered by tool)
├── ads: GenerationRecord[] (filtered by tool)
├── allImages: GenerationRecord[]
└── showUpgradeModal / setShowUpgradeModal
```

**Plans config:**
- Free: 3 credits/month, Flash only, watermark
- Starter: 20 credits/month, Flash only, no watermark
- Pro: 50 credits/month, Flash + Pro model

**Credit costs:** Flash = 1 credit, Pro = 2 credits

## 2. Model Selector Enhancement (`TopNavbar.tsx`)
- Pull `selectedModel` and `setSelectedModel` from AppContext
- Show active model badge (Flash = lightning icon, Pro = sparkle)
- When Free user selects Pro → open upgrade modal instead of switching
- Credits display reads from context (`creditsRemaining`)

## 3. Upgrade Modal (`src/components/app/UpgradeModal.tsx`)
- Dialog showing "Nano Bana Pro is available in the Pro plan"
- Three plan cards (Free/Starter/Pro) with feature comparison
- "Current Plan" badge on active plan
- CTA buttons for upgrade (simulated — just switches plan in context)

## 4. Credits Warning Banner
- When credits = 0, show a sticky banner: "You have reached your generation limit. Upgrade your plan to continue."
- Disable the Generate button when no credits remain

## 5. Credits Page (`src/pages/app/CreditsPage.tsx`)
Replace the placeholder at `/app/credits` with:
- Credits Remaining / Credits Used / Monthly Limit cards
- Progress bar showing usage (e.g., "72 / 90 credits used")
- Plan name badge
- Usage breakdown by model (Flash vs Pro)

## 6. Plan Page (`src/pages/app/PlanPage.tsx`)
Replace placeholder at `/app/plan` with:
- Current plan display
- Three plan comparison cards (same as upgrade modal)
- Switch plan buttons (simulated)

## 7. Generation Workflow Update (`useGenerationState.ts`)
- Accept model + tool from context
- Add two new steps: "Compositing Product" and "Rendering Image" (5 steps total per Phase 3 spec)
- Flash model: faster durations (~2.5s total), Pro: slower (~4s total)
- On complete: deduct credits via context, create a GenerationRecord, route to correct library

## 8. Generation History & Library Routing
- Every generation creates a `GenerationRecord` stored in AppContext:
  `{ id, prompt, tool, style, model, date, creditsConsumed, gradient }`
- **HistoryPage**: Shows ALL generations with full metadata (credits consumed, model used)
- **CatalogsPage**: Filters records where tool = "Generate Catalog"
- **AdsPage**: Filters records where tool = "Cinematic Ads" or "Ad Creatives"
- **ImagesPage**: Shows all records
- Each card gets: download, regenerate, duplicate prompt, delete actions

## 9. Admin Dashboard Enhancement (`AdminDashboard.tsx`)
Replace static data with computed mock analytics:
- Stats cards: Total Users, Total Generations, Total Credits Used, Revenue, AI Generation Cost
- **Daily Generations chart** — simple bar chart using CSS (no chart library)
- **Model Usage Distribution** — Flash vs Pro donut/bar
- **Tool Usage** — Catalog vs Ads vs Photography breakdown
- Recent activity feed

## 10. Admin Users Page (`src/pages/admin/AdminUsersPage.tsx`)
Replace placeholder with:
- Table of mock users (name, email, plan, credits, status)
- Actions: Edit credits, Change plan, Suspend user (simulated)

## 11. Admin Moderation Page (`src/pages/admin/AdminModerationPage.tsx`)
- Grid of mock generated images across platform
- Delete button per image
- Status badges (Approved/Pending/Flagged)

## 12. Admin Analytics Page (`src/pages/admin/AdminAnalyticsPage.tsx`)
- Daily generations bar chart
- Model usage distribution
- Tool usage breakdown
- Charts built with pure CSS bars (no external library)

## 13. Admin System Page (`src/pages/admin/AdminSystemPage.tsx`)
- System status indicators (API, AI Pipeline, Storage, CDN)
- Generation volume tracking
- Model usage metrics (Flash vs Pro counts)

---

## File Changes Summary

| File | Action |
|------|--------|
| `src/contexts/AppContext.tsx` | **Create** — global state provider |
| `src/components/app/UpgradeModal.tsx` | **Create** — upgrade/pricing dialog |
| `src/pages/app/CreditsPage.tsx` | **Create** — credits dashboard |
| `src/pages/app/PlanPage.tsx` | **Create** — plan management |
| `src/pages/admin/AdminUsersPage.tsx` | **Create** — user management table |
| `src/pages/admin/AdminModerationPage.tsx` | **Create** — content moderation |
| `src/pages/admin/AdminAnalyticsPage.tsx` | **Create** — analytics charts |
| `src/pages/admin/AdminSystemPage.tsx` | **Create** — system monitoring |
| `src/hooks/useGenerationState.ts` | **Update** — 5 steps, model-aware durations, credit deduction |
| `src/components/app/TopNavbar.tsx` | **Update** — context-driven model selector + credits |
| `src/pages/app/WelcomeDashboard.tsx` | **Update** — credit checks, zero-credit banner |
| `src/pages/app/HistoryPage.tsx` | **Update** — real history from context |
| `src/pages/app/CatalogsPage.tsx` | **Update** — filtered from context |
| `src/pages/app/AdsPage.tsx` | **Update** — filtered from context |
| `src/pages/app/ImagesPage.tsx` | **Update** — all images from context |
| `src/pages/admin/AdminDashboard.tsx` | **Update** — analytics charts + enhanced metrics |
| `src/layouts/AppLayout.tsx` | **Update** — wrap with AppContext provider |
| `src/App.tsx` | **Update** — new route registrations for Credits, Plan, admin pages |

