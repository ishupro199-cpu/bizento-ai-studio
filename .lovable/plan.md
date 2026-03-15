

# Bizento AI — Phase 2: AI Generation Workspace & UX

## What We're Building
The complete front-end generation workflow — from prompt input to loading animation to results display. No backend AI, purely UI/UX.

## Current State
Phase 1 delivered: layout shell, sidebar, top navbar, basic prompt bar, welcome dashboard, skeleton library pages (ImageGridPage reused), and admin panel. The prompt bar has tools dropdown and basic input. Library pages are identical grids with no filters.

---

## Implementation Plan

### 1. Style Selector Panel
Add a horizontal scrollable style selector to the generation workspace (WelcomeDashboard or a new GeneratePage).

**Styles:** Luxury Studio, Marble Product Scene, Floral Background, Minimal Catalog, Neon Futuristic, Beach Lifestyle

Each style = a selectable glass card with an icon/color swatch, name, and selected state (lime border). Clicking a style updates shared generation state.

### 2. Enhanced Prompt Bar
- Update placeholder to: *"Describe the product scene you want to create..."*
- Update tool descriptions to match Phase 2 spec
- Add AI suggestion chips above the prompt bar (contextual prompt ideas) that populate the input on click
- Wire the "+" button to show a file upload dialog (UI only, no actual upload processing)

### 3. Generation State Machine & Loading UI
Create a `useGenerationState` hook managing: `idle → uploading → generating → complete`

**Loading overlay/panel** with animated steps:
1. Analyzing Product
2. Removing Background
3. Generating Scene
4. Rendering Final Image

Smooth progress bar + step indicators with staggered animations. Triggered by clicking Generate.

### 4. Image Results Interface
After "generation" completes (simulated 3-4s delay), show a results panel:

- **3 mock generated images** in a responsive grid (glass cards)
- Hover actions: Download, Regenerate, Edit Prompt, Create Ad
- Full-screen image preview on click (dialog/lightbox)
- **Results info panel** below: prompt used, tool, style, timestamp, model indicator
- Quick actions: Download All, Regenerate, Save to Library

### 5. Enhanced Library Pages
Upgrade `ImageGridPage` with:
- **Filter tabs:** All, Catalog Images, Product Photography, Cinematic Ads, Ad Creatives
- **Card metadata:** tool used badge, generation date, download button
- Distinct mock data per page (Catalogs vs Ads vs Images vs History)

### 6. Generation Workspace Page
Refactor `/app` route: the Welcome screen becomes the initial state. After first generation, the workspace transforms to show results. Use state to toggle between welcome view and results view within the same page.

---

## File Changes

| File | Action |
|------|--------|
| `src/hooks/useGenerationState.ts` | Create — state machine + mock timer |
| `src/components/app/StyleSelector.tsx` | Create — horizontal style cards |
| `src/components/app/AISuggestions.tsx` | Create — suggestion chips above prompt |
| `src/components/app/GenerationLoading.tsx` | Create — step-by-step progress UI |
| `src/components/app/GenerationResults.tsx` | Create — results grid + info panel |
| `src/components/app/ImageLightbox.tsx` | Create — fullscreen image preview dialog |
| `src/components/app/PromptBar.tsx` | Update — new placeholder, file upload UI, connect to generation state |
| `src/pages/app/WelcomeDashboard.tsx` | Update — integrate style selector, generation flow, results display |
| `src/pages/app/ImageGridPage.tsx` | Update — add filter tabs, metadata badges, enhanced cards |
| `src/pages/app/CatalogsPage.tsx` | Update — pass filter-specific props |
| `src/pages/app/AdsPage.tsx` | Update — pass filter-specific props |

## Technical Approach
- Shared generation context via React state lifted to WelcomeDashboard (or a context provider if needed)
- `setTimeout` to simulate generation steps (800ms per step)
- Mock image results using placeholder gradients with product icons
- Framer-motion-free: CSS animations (`@keyframes`) for loading steps and transitions
- All within existing design system (glass cards, lime accent, dark theme)

