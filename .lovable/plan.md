

# Bizento AI — Phase 1: Foundation & UI Architecture

## Overview
Build the complete UI shell for Bizento AI — an AI-powered creative automation platform for ecommerce. This phase delivers the design system, layout architecture, and all page skeletons. No AI generation logic yet.

---

## 1. Design System
- **Dark theme** with `#222222` background, `#2D2D2D` card surfaces, `#89E900` lime accent
- **Inter font** (SF Pro inspired) with tight letter-spacing for premium feel
- Glass/blur effects on sidebar and prompt bar
- Consistent 12px border-radius on cards, subtle `rgba(255,255,255,0.08)` borders
- Hover effects: subtle lift + lime glow on cards, 200ms transitions

## 2. App Layout (ChatGPT-style)
Three-pane architecture shared across app pages:
- **Left sidebar** — collapsible (240px → 64px icon-only mode) with glassmorphism
- **Main workspace** — flexible center area
- **Bottom prompt bar** — floating pill-shaped command center
- **Top navbar** — fixed, with model selector and user controls

## 3. Sidebar
**Navigation:** Generate, My Catalogs, My Ads, Images, History  
**Account:** Plan, Billing, Credits  
**User profile card** at bottom: avatar, name, email, settings gear icon  
Collapse/expand animation with icon-only mode

## 4. Top Navbar
- **Left:** Model selector dropdown (Nano Bana Flash / Nano Bana Pro) with sparkle icon
- **Right:** Credits indicator, Upgrade button, Notifications icon, Help icon

## 5. Prompt Bar
Sticky bottom bar with:
- "+" image upload button (left)
- Text input: *"Describe the product scene you want to generate..."*
- Tools dropdown (Generate Catalog, Product Photography, Cinematic Ads, Ad Creatives — each with description)
- Generate button (right, lime accent)

## 6. Welcome Screen (Dashboard Home)
- Headline: "Welcome to Bizento AI"
- Subheadline: "Turn your product photos into professional catalog images and ads with AI."
- Animated demo area showing product photo → professional visual transformations
- Clickable prompt suggestion chips below

## 7. App Pages (Skeleton)
- **Generate** — workspace with prompt bar and image results grid
- **My Catalogs / My Ads / Images / History** — grid layouts with filter controls
- **Image cards** — preview, download, regenerate, edit prompt (actions on hover)

## 8. Marketing Website
Pages: Landing, Features, Pricing, Demo, Login/Signup  
Landing page sections: Hero, Problem, Solution, AI Tools Overview, Before/After Demo, Pricing Preview, CTA

## 9. Admin Panel
Sidebar navigation with: Dashboard, Users, Credits, Billing, AI Analytics, Catalog Moderation, Support, System Monitoring  
Dashboard showing: total users, total generations, credits usage, revenue cards

## 10. Routing
- `/` — Marketing landing page
- `/features`, `/pricing`, `/demo` — Marketing pages
- `/login`, `/signup` — Auth pages
- `/app` — Main dashboard (welcome screen)
- `/app/catalogs`, `/app/ads`, `/app/images`, `/app/history` — Library pages
- `/admin` — Admin dashboard
- `/admin/users`, `/admin/credits`, etc. — Admin pages

