# Bizento AI

## Overview
AI-powered product photography and creative automation platform. Users upload product photos and generate professional catalog images, cinematic ads, and social media creatives using AI.

## Architecture
- **Frontend**: React 18 + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Radix UI components)
- **Routing**: React Router DOM v6
- **Auth & DB**: Firebase (Auth, Firestore, Storage)
- **State**: TanStack React Query
- **Forms**: React Hook Form + Zod

## Project Structure
```
src/
  components/
    app/        # App-specific components (sidebar, navbar, prompt bar, etc.)
    ui/         # shadcn/ui component library
  contexts/     # React contexts (Auth, App)
  hooks/        # Custom hooks (Firestore, image upload, generation state)
  layouts/      # AppLayout, AdminLayout
  lib/          # Firebase config, utilities, prompt augmentation
  pages/
    website/    # Public marketing pages (Landing, Features, Pricing, Login, Signup)
    app/        # Protected app pages (Dashboard, Catalogs, Ads, Images, etc.)
    admin/      # Admin panel pages
```

## Running the App
- **Dev server**: `npm run dev` (runs on port 5000)
- **Build**: `npm run build`

## Firebase
Firebase config is in `src/lib/firebase.ts`. The project uses Firebase Auth, Firestore, and Storage.

## Key Features
- Product photo upload and AI generation
- Catalog image generation
- Cinematic ad creation
- Ad creative generation
- Prompt library
- Credit system
- Admin panel
