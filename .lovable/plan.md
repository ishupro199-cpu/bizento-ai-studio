

# Bizento AI — Phase 4: AI Integration Architecture & Generation Pipeline with Firebase

## Reality Check

Phase 4 asks for a **real AI generation pipeline** (vision analysis, background removal, scene generation, compositing). However, there are critical constraints:

1. **Lovable cannot run backend code** — no Node.js server, no Python
2. **AI APIs (OpenAI, Stability, Remove.bg) require secret API keys** — these cannot be safely exposed client-side
3. **Firebase works client-side** — Auth, Firestore, Storage are all feasible

**Practical approach:** Set up the full Firebase infrastructure (Auth, Firestore, Storage) for real data persistence + real image uploads. The AI generation pipeline will be **architecturally prepared** with proper interfaces but will use **simulated AI processing** until you connect a backend service (Firebase Cloud Functions or similar) later.

---

## Implementation Plan

### 1. Firebase Setup (`src/lib/firebase.ts`)
- Initialize Firebase app with client-side config (publishable keys — safe in code)
- Export `auth`, `db` (Firestore), `storage` instances
- User will need to provide Firebase project config values

### 2. Firebase Auth Integration
- Replace mock user in `AppContext` with real Firebase Auth
- Update `LoginPage` and `SignupPage` to use `signInWithEmailAndPassword` / `createUserWithEmailAndPassword`
- Add `onAuthStateChange` listener for session persistence
- Protect `/app` and `/admin` routes with auth guard
- Create user profile document in Firestore on signup

### 3. Firestore Data Model
```text
users/{uid}
├── name, email, plan, creditsRemaining, creditsUsed
├── flashGenerations, proGenerations

generations/{generationId}
├── userId, prompt, tool, style, model
├── creditsConsumed, createdAt
├── images[] (storage URLs)
├── status: "completed" | "failed"
```

### 4. Firebase Storage — Image Upload & Storage
- Real image upload via `+` button → Firebase Storage `uploads/{uid}/{timestamp}`
- Generated images stored at `generated/{uid}/{tool}/{timestamp}/`
- Get download URLs for display in results grid and library pages
- Show upload progress indicator

### 5. Generation Pipeline Architecture
Update `useGenerationState.ts`:
- **Step 1 — Upload**: Real image upload to Firebase Storage
- **Step 2 — Analysis**: Simulated (placeholder for future vision API)
- **Step 3 — Background Removal**: Simulated (placeholder for Remove.bg API)
- **Step 4 — Scene Generation**: Simulated (placeholder for Stability/DALL-E)
- **Step 5 — Compositing**: Simulated
- **Step 6 — Rendering**: Simulated, generates gradient placeholders
- **Step 7 — Save**: Real save to Firestore + metadata storage

### 6. Prompt Augmentation (Client-side)
- Build a local prompt enhancement system using keyword mapping
- Example: "perfume bottle" → "luxury perfume bottle product photography with cinematic lighting and marble background"
- Style presets inject additional keywords into the prompt
- No AI API needed — rule-based enhancement

### 7. Real Data in Library Pages
- `HistoryPage`, `CatalogsPage`, `AdsPage`, `ImagesPage` — query Firestore instead of in-memory state
- Real-time listeners (`onSnapshot`) for live updates
- Delete generations from Firestore + Storage

### 8. Credits System with Firestore
- Credits tracked in Firestore `users/{uid}` document
- Deduct on generation, check before allowing
- Plan switching updates Firestore document

### 9. Admin Panel — Firestore Queries
- Admin pages query across all users' data
- Total generations count, model usage distribution from Firestore aggregation
- User management reads from `users` collection

---

## File Changes

| File | Action |
|------|--------|
| `src/lib/firebase.ts` | **Create** — Firebase init (auth, db, storage) |
| `src/contexts/AuthContext.tsx` | **Create** — Firebase auth state provider |
| `src/components/app/ProtectedRoute.tsx` | **Create** — auth guard component |
| `src/hooks/useFirestore.ts` | **Create** — Firestore CRUD hooks for generations |
| `src/hooks/useImageUpload.ts` | **Create** — Firebase Storage upload hook with progress |
| `src/lib/promptAugmentation.ts` | **Create** — rule-based prompt enhancement |
| `src/contexts/AppContext.tsx` | **Update** — integrate with Firestore for persistence |
| `src/hooks/useGenerationState.ts` | **Update** — real upload step, Firestore save step |
| `src/components/app/PromptBar.tsx` | **Update** — show uploaded image preview, upload progress |
| `src/pages/app/WelcomeDashboard.tsx` | **Update** — pass uploaded image to generation pipeline |
| `src/pages/website/LoginPage.tsx` | **Update** — real Firebase auth |
| `src/pages/website/SignupPage.tsx` | **Update** — real Firebase auth + profile creation |
| `src/pages/app/HistoryPage.tsx` | **Update** — Firestore query |
| `src/pages/app/CatalogsPage.tsx` | **Update** — Firestore filtered query |
| `src/pages/app/AdsPage.tsx` | **Update** — Firestore filtered query |
| `src/pages/app/ImagesPage.tsx` | **Update** — Firestore query |
| `src/App.tsx` | **Update** — wrap with AuthProvider, add protected routes |

## Dependencies to Install
- `firebase` (Firebase JS SDK)

## User Action Required
You will need to:
1. Create a Firebase project at console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Firebase Storage
5. Provide the Firebase config object (apiKey, authDomain, projectId, etc.)

These are **publishable keys** — safe to store in code.

