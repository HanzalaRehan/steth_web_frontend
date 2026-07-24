# PROGRESS.md — Steth_web_frontend

## Session: Issue #1 (admin panel merge) + Part B.2 (RBAC) (2026-07-23)

This is this repo's first `PROGRESS.md` entry. Merged all 19 real screens from the separate `Steth_admin_Panel` (Next.js) into this app as an authenticated `/admin/*` section, working alongside matching RBAC work in `Steth_web_backend`. `Steth_admin_Panel` itself was left completely untouched (confirmed — it turned out to never have been a committed git repo at all, everything shows as untracked; either way, nothing in it was read-then-changed). No deploy/delete of its Vercel project was done, per instruction — that's a manual step for you.

Commits, in order (`git log`):

### Phase 2 — Auth plumbing
- `src/config/api.js`: single `API_BASE_URL`, reads `VITE_API_URL` with a fallback to the existing hardcoded literal. `.env.example` documents it.
- `src/pages/Login&Signup/AdminRoute.jsx` (new): mirrors the existing, previously-unused `ProtectedRoute.jsx` guard pattern, adds a `user.role === 'admin'` check. Client-side hiding only — the real enforcement is the backend's `auth`+`isAdmin` on every admin route.
- `src/pages/Login&Signup/Login.jsx`: both admin branches (password + Google) used to skip saving the token and hard-redirect via `window.location.href` to the separate `steth-admin-panel.vercel.app` deployment with the token in a query string. Now they save the token like any other login and `navigate('/admin')` internally. Routed through `AuthContext.login()` instead of this file's own duplicated `decodeJWT`/`isTokenExpired`/`saveToken` helpers — `login()` decodes the token into context state immediately, so `role` is available right after login, not just after a refresh (this is what makes `AdminRoute` work without a bounce). Fixed 3 hardcoded backend-URL occurrences in this file.
- `src/router/Router.jsx`: temporary `/admin` stub (replaced properly in phase 4).

### Phase 3 — Styling foundation
- `tailwind.config.js`: merged the shadcn CSS-variable theme from the admin panel's `tailwind.config.ts` (`darkMode:"class"`, color scheme, `borderRadius`, accordion keyframes) plus `tailwindcss-animate`. Folded in the `navy-blue` color that was sitting dead in `tailwind.config.cjs` — confirmed `.js` is the config Tailwind actually loads (`.cjs` was silently shadowed), so `Header.jsx`'s `navy-blue` class had likely been an unstyled no-op in production. Deleted `tailwind.config.cjs`.
- `src/index.css`: added the shadcn CSS custom properties to `:root` (sourced from the admin panel's actually-used `styles/globals.css`, not the dead `app/globals.css`). Deliberately did **not** port shadcn's own `body { @apply bg-background text-foreground }` rule — that would repaint the whole storefront's body. `AdminLayout` applies those classes on its own root element instead, so the effect stays scoped to `/admin/*`.
- `vite.config.js`: added an `@` alias to `src/`, matching the admin panel's `@/components`/`@/lib`/`@/hooks` convention so ported files' imports work unchanged.
- Ported **10 shadcn/Radix primitives + the sonner toast wrapper** to `src/components/ui/` (not the source repo's full 50-file set — see "What wasn't ported" below), converted from `.tsx` to `.jsx` (this repo has no TypeScript). Added the 6 `@radix-ui/*` packages, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `sonner`, `@tailwindcss/aspect-ratio` to `package.json`.
- Fixed two ESM/CommonJS mismatches the port surfaced: `tailwind.config.js` needed `import` instead of `require()` for its plugins, `vite.config.js` needed `fileURLToPath(import.meta.url)` instead of `__dirname` — this project has `"type": "module"` in `package.json`.

### Phase 4 — All 19 screens ported
Folder: `src/pages/Admin/` (flat-ish structure under one root, not the usual one-page-one-folder convention — justified since these are one cohesive section, not independent site pages).

| Screen(s) | Notes |
|---|---|
| `AdminLayout.jsx` | Sidebar/header shell. Nav is data-driven (one array) instead of 7 near-identical blocks. Logout goes through `AuthContext.logout()` + internal `navigate('/login')`, not a manual `localStorage` clear + hard redirect to the external `stethset.com` domain. Dropped a `showLogout` state that was set on avatar click but never actually rendered anything (half-built, never finished in the original). |
| `Dashboard.jsx` | Stat cards, revenue, best-sellers, recent student verifications. |
| Product Management (7 screens: hub, list, delete, add, update, 2 image-upload screens) | Data handoff between screens (create → image upload, update → update-images) now goes through React Router `navigate(path, {state})` instead of URL-encoded JSON blobs in query strings. |
| Customers Also Bought (2 screens) | Fixed real bugs: the edit screen fetched a single product expecting `productData.product` (singular — doesn't exist, actual shape is `{success, data}`) and saved via `PUT /api/products/:id/related`, which doesn't exist on the backend at all. Now uses the standard shape and saves through the existing `PUT /api/products/:id` (which already accepts a `relatedProducts` array generically — no new backend route needed). |
| Student Approval (2 screens) | Removed a hardcoded, likely-expired JWT that was committed in source on the original's approve/reject calls (the *only* place in the whole admin panel that ever sent an `Authorization` header). Replaced `localStorage.setItem('currentVerification')` hand-off with `navigate(path, {state})`. The proof-document image goes through this session's new backend image-proxy route, which requires an `Authorization` header — a plain `<img src>` can't send one, so it's fetched as a blob via `fetch()` and rendered through an object URL. |
| Orders (2 screens) | update-status now uses `GET /api/orders/details/:orderId` (already existed, wasn't used) instead of fetching all orders with `limit=999999` and filtering client-side — needed a backend fix first (see `Steth_web_backend`'s PROGRESS.md, `getOrderById`). **Fixed a real bug**: the status dropdown's options were lowercase (`'pending'`, `'shipped'`...) but the schema's `orderStatus` enum is capitalized and Mongoose enum validation is case-sensitive — every status update in the original would have failed validation. Now uses the exact enum values. |
| Hero Images, Color Tiles, Newsletter, Settings | Independent screens, each got `Authorization` headers added since their backend routes are now gated. |

Every write call added an `Authorization: Bearer` header where the corresponding backend route is now gated (Part A last session, or Phase 1 this session) — the original admin panel called nearly all of these unauthenticated, since almost nothing was gated before this work.

Standardized on `sonner` for toasts throughout (raw `alert()` calls and the admin panel's mixed `sonner`/shadcn-`use-toast` usage both replaced).

### What wasn't ported (and why)
- `app/product-management/update/page.tsx` — confirmed dead in the source: it read a query param and immediately redirected to either `update/[id]` or `list`; its rendered form body (mock data, an `alert()` on submit) never actually showed. No route registered for it here.
- `chart.tsx`, `calendar.tsx`, `command.tsx`, `drawer.tsx`, `resizable.tsx`, `input-otp.tsx` (6 of the source repo's 50 shadcn/ui files) — none of the 19 real screens import them (confirmed via grep across `app/**/page.tsx`), and each needs its own extra dependency (`recharts`, `react-day-picker`, `cmdk`, `vaul`, `react-resizable-panels`, `input-otp` respectively) that would otherwise sit unused. Easy to add later, either via shadcn's own CLI or by copying from the (still-intact) admin repo, if a future screen actually needs one.
- `app/api/hero-images/**` (Next API routes) — confirmed dead: talk to Cloudinary directly, but the real hero-image feature already goes straight to the Express backend from the page itself. Nothing to port.
- The 5 top-level `components/*.tsx` files in the admin panel (`metrics-card`, `stats-chart`, `vault-table`, `navigation`, `theme-provider`) — confirmed unused by any of the 19 real screens (its own `CLAUDE.md` calls them "reusable building blocks," but that description was stale).

### Known limitation carried over, not introduced
Student Approval's detail screen has no backend route to fetch a single verification by id — a direct link or page refresh has no data to show. Same limitation the original had (it relied on `localStorage` always having been set by a prior list-page visit); not something this port broke, just not something it was asked to fix.

### Hardcoded backend URL — 27 files still remain
28 files hardcoded `https://steth-backend.onrender.com` at the start of this session (confirmed by grep, matching `CLAUDE.md`'s claim). `Login.jsx` is now fixed (touched anyway for the admin-branch rewrite) and `src/config/api.js` is the new canonical home for the literal (as a fallback default) — both `AdminRoute.jsx` and every file under `src/pages/Admin/` use `API_BASE_URL`, not a new hardcoded occurrence. The other 27 pre-existing storefront files were out of scope for this session and remain as-is:
```
src/components/Header.jsx
src/components/NewsletterSignup.jsx
src/pages/AboutUs/AboutUs.jsx
src/pages/Cart/Cart.jsx
src/pages/Cart/Components/YouMayAlsoLike.jsx
src/pages/Checkout/CheckoutPage.jsx
src/pages/Checkout/Components/ContactForm.jsx
src/pages/Checkout/Components/MobileOrderSummary.jsx
src/pages/Checkout/Components/OrderSummary.jsx
src/pages/ColorProduct/ColorProductPage.jsx
src/pages/Homepage/Components/ColorTile.jsx
src/pages/Homepage/Components/ColorTileCarousal.jsx
src/pages/Homepage/Components/Hero.jsx
src/pages/Homepage/Components/MensBestSeller.jsx
src/pages/Homepage/Components/WomenBestSellers.jsx
src/pages/Login&Signup/OTP.jsx
src/pages/Login&Signup/Password-Recovery.jsx
src/pages/Login&Signup/SignUp.jsx
src/pages/Menspage/Components/Hero.jsx
src/pages/Menspage/Components/MensBestSeller.jsx
src/pages/Menspage/Components/Products.jsx
src/pages/ProductDetailPage/ProductDetail.jsx
src/pages/Profile/Profile.jsx
src/pages/Student/Student.jsx
src/pages/Womenpage/Components/Hero.jsx
src/pages/Womenpage/Components/Products.jsx
src/pages/Womenpage/Components/WomenBestSellers.jsx
```

### Verification
`npm install`, `npm run lint`, and `npm run build` were run for real after every phase (this sandbox handles Vite's toolchain fine, unlike the backend's much larger `node_modules` — see the backend's PROGRESS.md for that limitation). Final build: 2070 modules, clean, up from 1969 before phase 4 — confirming all new screens and components are genuinely bundled/reachable, not dead code. Click-through/visual verification of the live `/admin/*` screens against a real backend wasn't possible in this sandbox (no DB access, per the backend's own PROGRESS.md) — static verification (lint + build + manual code review) is what's actually been done here, not a live walkthrough.

### What's next
Per the master plan's Part D: B.1 data model work (Fabric/Category/Color/Vendor/Shipment), then the auth/UX cluster (login/signup rebuild, header rebuild), then navbar/footer rebuild — all separate future sessions. `npm run build`'s bundle-size warning (>500kB, mentioned every build) is pre-existing, not something this session introduced or was asked to address.

---

## Session: Part B.1 — admin CRUD for Fabric/Category/Color/Product/Inventory/Vendor/Shipment (2026-07-23)

Backend half of this session added the new Fabric/Category/Color/Vendor/Shipment models + CRUD + an atomic Shipment-receive endpoint (see `Steth_web_backend`'s PROGRESS.md for the schema decisions). This repo's half: 5 new admin screens + rewiring the existing Product Add/Update flow onto the real data instead of hardcoded arrays. Commits in order (`git log`): Fabric/Category/Colors/Vendor screens → Inventory screen → nav/route wiring → ProductAdd/ProductUpdate/ProductImages rewiring.

### 5 new screens, `src/pages/Admin/`
| Screen | Notes |
|---|---|
| `Fabric/Fabric.jsx` | Composition builder: repeatable material/percentage rows, running total shown live, submit disabled until it sums to 100 — mirrors the backend's own `pre('validate')` check, doesn't replace it. |
| `Category/Category.jsx` | Simple list CRUD (name only). |
| `Colors/Colors.jsx` | Card grid + swatch upload, matching `ColorTiles.jsx`'s existing hover-to-delete grid pattern. Named **"Colors"**, distinct from the pre-existing **"Color Tiles"** nav item (unrelated `ColorTile` model for homepage swatches) — same name would've been confusing in the sidebar. |
| `Vendor/Vendor.jsx` | Simple list CRUD (name/contact/email/phone/address). Backend gates all its routes to `admin`+`warehouse_manager`, not just `admin`. |
| `Inventory/Inventory.jsx` | Two tabs: Stock Levels (per-product color/size table, inline stock edit against the existing absolute-value `updateInventory` endpoint) and Receive Shipment (vendor select + repeatable product/color/size/pieces line items, posts to the new atomic `POST /api/shipments`). |

Nav: 5 new `NAV_ITEMS`/`PAGE_TITLES` entries in `AdminLayout.jsx`. Routes: 5 new `<Route>` entries in `Router.jsx`, all inside the existing `AdminRoute`-guarded `/admin` tree — no new unguarded route shipped.

**Frontend RBAC gap, not introduced this session but worth flagging now that it's load-bearing:** `AdminRoute.jsx`'s `ALLOWED_ROLES` is `['admin']` only — the *entire* `/admin/*` section, not just these 5 new screens, is client-side-gated to `admin` regardless of what the backend permits. That means a `warehouse_manager` user (a role that exists specifically so Vendor/Shipment/Inventory can be delegated, per the backend RBAC session) can't reach any `/admin/*` screen at all today, even though the backend correctly allows their role on Vendor/Shipment routes. This is a pre-existing limitation from the RBAC session, not something this session's 5 new routes changed — flagging it here because Part B.1 is the first time it actually matters (the previous 19 screens were all admin-only in practice anyway). Widening `AdminRoute` to accept `warehouse_manager` for specific routes wasn't requested this session and touches every existing screen's access model, not just the new ones — worth its own explicit decision, not a side effect.

### Product Add/Update rewiring
`ProductAdd.jsx`/`ProductUpdate.jsx`: Category and Color dropdowns now fetch from `/api/categories`/`/api/colors` instead of hardcoded arrays; a new optional Fabric dropdown fetches from `/api/fabrics`. A new Attributes picker (repeatable name/icon-URL rows) was added to both. Gender enum narrows to `Men`/`Women`/`Unisex` in both forms. Submission now sends `categoryRef`, `fabric`, `colorRefs`, and `attributes` alongside the pre-existing `category`/`colors` strings — additive, nothing that already worked stops working.

**Real bug fixed in passing:** `ProductUpdate.jsx`'s `GENDERS` constant had lowercase values (`'men'`/`'women'`) while the schema enum is capitalized (`'Men'`/`'Women'`) — every actual dropdown selection would have failed server-side validation on save; only the "custom gender" free-text fallback happened to work, which is presumably why this hadn't been noticed. Fixed to match the schema exactly, and removed the "custom gender" escape hatch entirely now that the enum is a hard 3-value set — keeping it would let admins bypass the narrowing you just asked for.

---

## Session: Auth/UX cluster — issues #5, #6, #7/A6, #8 (2026-07-23)

A6 (send OTP on registration, gate login on `isVerified`, treat Google accounts as pre-verified) was already fully done backend-side (confirmed in `Steth_web_backend`'s PROGRESS.md, prior session) but never wired into this repo's UI — `SignUp.jsx` redirected straight to `/login` after registering, and no screen anywhere called `/verify-registration-otp`. That gap, plus #5 (login/signup should be a slide-over, not a routed page duplicating `<Header/>`) and #8 (Header's 8 overlapping `@media` blocks), were the actual work here. Plan mode was used for the login/signup restructure specifically, per your request, since it touched routing and auth state read in multiple places outside `AuthContext`. Commits in order (`git log`): `AuthContext` panel state → the panel itself (new components + deleted old pages + compat wiring) → `OTP.jsx` URL fix → `Header.jsx` (auth wiring + responsive rebuild).

### Architecture: login/signup panel
`AuthContext.jsx` gained `authPanel: {isOpen, mode, meta}` + `openAuthPanel`/`closeAuthPanel` — kept in the existing context rather than a new one, since this is auth UI state. `src/components/AuthPanel/AuthPanel.jsx` renders once in `App.jsx` (sibling to `<AppRouter/>`), not embedded in `Header.jsx` — avoids depending on every page rendering Header and avoids any duplicate-mount risk. `LoginForm.jsx`/`SignupForm.jsx`/`VerifyOtpForm.jsx` are the three modes; switching between them (e.g. "Sign up" link, post-registration handoff to OTP) swaps content in place, no full close/reopen.

Header's Login control (desktop + mobile) now calls `openAuthPanel('login')` directly — no navigation, panel just layers over whatever page is showing, which is the literal ask in #5. `/login` and `/signup` stay as routes (`AuthRedirect.jsx`, new) purely for backward compat with existing `navigate('/login')`/`navigate('/signup')` call sites that weren't touched: `Cart.jsx` (`{state:{from:'/cart'}}`, preserved — `LoginForm` reads `meta.from` to redirect to `/checkout` same as before), `Profile.jsx`, `AdminLayout.jsx`, `Student.jsx`, `PopUp.jsx`. `/otp` (password-reset) and `/password-recovery` were **not** swept into the panel — only issue #5's named pages moved; that would have been scope creep.

Deleted `Login.jsx`/`SignUp.jsx` outright (confirmed via grep only `Router.jsx` imported either).

### A6 frontend wiring (issues #7)
`SignupForm.jsx`: on successful registration, switches to `mode:'verify'` with the returned email instead of the old redirect-to-`/login`. `VerifyOtpForm.jsx` (new) calls `/verify-registration-otp`, resend calls the existing generic `/resend-otp`. `LoginForm.jsx`: a `403` "please verify your email" response (backend sends `{message, email}`) now routes into `mode:'verify'` with that email prefilled, instead of just showing a red error banner with no path forward.

Two real bugs fixed while rewriting `SignupForm.jsx`: its 2 hardcoded `steth-backend.onrender.com` URLs (missed in the earlier hardcoded-URL cleanup — `CLAUDE.md` claimed this was done everywhere, it wasn't), and its Google-auth success path used to write `localStorage` directly instead of calling `AuthContext.login()`, leaving the rest of the app (including Header) unaware of the new session until next reload.

### Google OAuth (#6)
Confirmed both `Login.jsx` and `SignUp.jsx` called `google.accounts.id.prompt()` (One Tap) unconditionally on every mount, alongside the already-rendered standard button. **You chose to drop it** — `LoginForm.jsx`/`SignupForm.jsx` now render only the standard button, no `prompt()` call. Reasoning we agreed on: the panel can now open/close repeatedly within one page load instead of via fresh page mounts, so calling `prompt()` every open would be considerably more aggressive than the old every-mount behavior already was.

**Google Cloud Console checklist — I can't check this myself, you need to verify:**
- OAuth consent screen: "Testing" (100 user cap + "unverified app" warning) vs "In production" — confirm which.
- Authorized JavaScript origins on the OAuth Client ID: exact production frontend origin + local dev origin. This flow uses `ux_mode:'popup'` via Google Identity Services, so it's origins that matter, not redirect URIs.
- App branding completeness (name, support email, logo, homepage/privacy/terms links) — required to publish and avoid the unverified-app screen.
- Scopes requested: confirm nothing beyond basic profile/email (anything more needs separate Google review).
- Test users list, if still in Testing mode.

Also worth restating from the backend's PROGRESS.md: `backfillIsVerified.js` was never confirmed run against production. Not this session's problem to fix, but this session is the first time the `isVerified` login gate becomes reachable through a real UI (the OTP-verify panel), so it's worth checking before this ships.

### Header responsive rebuild (#8)
Confirmed this Vite project has no styled-jsx plugin configured, so the `<style jsx>` block wasn't scoping anything — the 8 `@media` blocks were just unscoped global CSS the whole time (a latent class-name-collision risk, on top of being unmaintainable). Replaced with a 3-column CSS grid (logo | nav | icons) instead of a flex row with the center nav absolutely-centered on the *entire* header regardless of its siblings' widths. That absolute-centering was the actual root cause the old media queries were patching around — it doesn't know the icons-container's real width, so at real viewport widths (confirmed ~1024-1150px) the two visibly overlapped. Grid columns can't overlap by construction, which is what "coherent" needed to mean here, not just fewer/prettier breakpoints.

Search-box width and header padding now use Tailwind arbitrary-value `clamp()` (continuous scaling) instead of 5-7 discrete, overlapping tiers per property. Nav gap/font-size, logo size stayed on the standard Tailwind breakpoint prefixes that were already coherent once the conflicting custom CSS was removed.

**Real bug found and fixed while retuning the search box width:** a pre-existing GSAP entrance animation was tweening the search box's `width` from `0%` to `100%` on mount. GSAP sets these as inline styles, which beat any CSS class permanently once the tween finishes — meaning the *old* media-query widths were also being silently overridden by this the entire time, not just my new `clamp()` value (confirmed by inspecting the live inline style: it was stuck at `width:100%`, computing to a much narrower rendered width than any CSS rule specified, due to how that percentage resolved in the flex context). Changed the animation to an opacity-only fade so the actual Tailwind width class takes effect and stays stable.

Not touched: nav link order/content, dropdowns, marquee slider, mobile menu structure, search logic — all reserved for #23 per your instruction, and this rebuild doesn't make that harder to build on top of (if anything, the grid layout is a better foundation for adding dropdowns than the old absolute-positioned nav was).

### Verification
`npm run lint` (full project): 62 pre-existing problems, unchanged count, none in any file this session touched (confirmed via diff against the prior session's baseline). `npm run build`: 2441 modules, clean (first attempt hit a sandbox-level `ETIMEDOUT` reading a file mid-build — pure I/O flakiness, unrelated to the code; retry succeeded cleanly). Manual click-through in the browser preview at 375px and 1024-1920px: panel opens from Header, slides from the left, both Login and Signup forms fit with no scroll needed at either viewport, mode-switching works without a full close/reopen, `/login` and `/signup` direct navigation both correctly open the panel over the homepage, Header's own login-state updates immediately after a panel login (no stale UI), and the search-box/nav overlap is gone at every width checked (measured directly via `getBoundingClientRect`, not just eyeballed).

**Not done, by your choice:** live submission of a real login/signup/OTP round-trip. This dev environment has no `.env`/`.env.local`, so `API_BASE_URL` falls back to the real production backend — there's no dev/staging backend configured for this repo. Submitting a real signup would create a genuine production user record and send a real email. You chose to skip this and rely on the panel-mechanics verification above instead.

### What's next
Live-verify the full login → OTP-verify → login round trip against a real (dev/staging, not production) backend once one exists for this repo. Check the Google Cloud Console items above. Per the master plan: navbar/footer rebuild (#23) next, building on top of the Header grid layout landed here rather than the old absolute-centered nav.

`ProductImages.jsx` (the image-upload screen shown right after creating a product) gets a new panel, shown only when the product's gender is `Unisex`: per-color Men/Women image-set upload, hitting a new backend endpoint (`POST /:id/images/variant/:color/:gender`) that writes into `Product.variants` rather than the existing `colorImages`.

**Scope call, not done:** `ProductUpdateImages.jsx` — the separate, narrower screen for uploading images to colors newly added during a product *update* (not creation) — was **not** extended with the same per-gender panel. It only receives the newly-added colors via route state, not the product's gender, and wiring that through was judged lower-value than the primary create-flow screen every new product actually goes through. If a Unisex product needs per-gender images added to a color introduced after initial creation, that has to go through direct API calls today, not this screen. Flag if you want this closed.

### Verification
`npm run lint`: 0 errors/warnings in every file touched this session (confirmed via `grep` against the full lint run's output — the 68 pre-existing issues elsewhere in the repo are all in files this session never opened). `npm run build`: succeeded, 2075 modules (up from 2070 in the prior session), only the pre-existing >500kB bundle-size warning. Live click-through against the running admin UI wasn't done — same sandbox DB-connectivity gap as the backend (see its PROGRESS.md); static verification (lint + build + manual trace against the confirmed backend response shapes) is what's actually been done here.

### What's next
Optional: extend `ProductUpdateImages.jsx` with the same per-gender variant panel if that gap above turns out to matter in practice. Widening `AdminRoute` for `warehouse_manager` if you want that role to actually reach Vendor/Shipment/Inventory, per the gap flagged above. Otherwise, next per the master plan is the auth/UX cluster (login/signup rebuild, header rebuild) and navbar/footer rebuild.

---

## Session: Navbar + footer rebuild — issues #23, #24, + B.4 (Gift Cards, Blog, Privacy, FAQs, Affiliate) (2026-07-23)

Confirmed Part B.1 (Fabric/Category/Color entities) was done, per your instruction to stop rather than build against data that doesn't exist. Plan mode was used for the navbar data-fetching approach specifically, per your request — approved plan at `~/.claude/plans/buzzing-cooking-pretzel.md`. Commits in order (`git log`): hook + MegaMenu/AboutDropdown components → Header.jsx nav rebuild → Men's/Women's `Products.jsx` URL-param support → Footer.jsx rebuild → 7 new pages + Router.jsx wiring → checkout gift-card integration (3 files).

### Navbar (#23)
New `src/hooks/useCatalogTaxonomy.js`: module-scoped `cache`/`inFlight` variables (outside the hook, not a new caching library) fetch Fabric/Category/Color once per page-load and serve every later `Header` remount from memory — chosen because `Header.jsx` has no shared app shell and remounts on every route navigation (confirmed in an earlier session). Cache lives for the page-load lifetime only; a hard refresh re-fetches. Deliberate tradeoff, not a bug — this data is admin-managed and changes rarely, and a full library (TanStack Query/SWR) would be new-dependency overkill for three small unpaginated lists.

New order: **Women, Men, Rewards, About STETH** (Students removed from the nav entirely, moved to footer-only per the approved plan). Women/Men are 3-column dropdown panels (`src/components/Navbar/MegaMenu.jsx`) — Shop By Color (swatch tile via `color.hexCode` inline style + name), Shop By Fabric, Shop By Category — all pulling real data from the hook, not hardcoded lists. About STETH is a 2-item dropdown (`AboutDropdown.jsx`): Our Story, Blog. Desktop uses `onMouseEnter`/`onMouseLeave`-triggered `absolute` panels; mobile reuses the existing full-screen menu overlay with a new accordion (`mobileExpandedSection` state) instead of a second mechanism.

**Made the megamenu functionally real, not just decorative** — this needed two backend-adjacent fixes that weren't originally scoped as their own tickets but were prerequisites: `getAllProducts` gained additive `categoryRef`/`colorRefs`/`fabric` filters (see backend PROGRESS.md), and `Menspage`/`Womenpage`'s `Products.jsx` (previously zero URL-awareness — `categoryFilter`/`colorFilter` were local state, always `"All"` on mount) now read those three params via `useSearchParams` and pass them into the product fetch. Clicking a "Shop By" entry now actually lands on a filtered grid, not just a page.

### Footer (#24)
Four columns exactly per spec. Col 1: brand + Facebook/TikTok icons added (inline SVG, same pattern as the existing Instagram `<a>`) — **using placeholder `href="#"` for both, confirmed with you via AskUserQuestion** (no real profile URLs exist yet), flagged in-code and here so they're easy to find and swap later. Col 2 Shop: Women, Men, Gift Cards. Col 3 About: Our Story, Blog, Privacy Policy, Terms and Conditions. Col 4 Help: FAQs, My Orders (→ `/profile`, today's account page), Student Program, Loyalty Program (→ `/rewards`), Affiliate Program. Old "GET HELP" column (Contact Us/email/phone) dropped entirely — not in the new 4-column spec, disclosed as intentional in the approved plan, not an oversight. Copyright year templated as `{new Date().getFullYear()}` (issue #21), replacing the hardcoded `© 2025`.

**Every footer link resolves to a real page — none are dead `#`/404s**, per your explicit ask to make that call: `/rewards`, `/gift-cards`, `/blog`, `/privacy`, `/faqs`, `/affiliate` are all new real pages this session (see below), not placeholders-with-a-later-build-promise.

### New pages (`src/pages/`)
- **Rewards/Rewards.jsx** (`/rewards`) — minimal "Coming Soon" placeholder, shared target for both the navbar's Rewards link and the footer's Loyalty Program link.
- **GiftCards/GiftCards.jsx** (`/gift-cards`) — purchase form (preset + custom amount, recipient email, optional note), posts to the new `POST /api/gift-cards/purchase`, shows the generated code on success. Guest-purchasable, no login required.
- **Blog/BlogList.jsx** + **Blog/BlogDetail.jsx** (`/blog`, `/blog/:slug`) — public list/detail fetching the new BlogPost endpoints. **Admin CRUD screen deferred, per your explicit invitation to make that call** — backend has full CRUD, posts get created via direct API calls until a future session builds the admin screen.
- **PrivacyPolicy/PrivacyPolicy.jsx** (`/privacy`) — real written content (5 sections), adapted/expanded from `TermsAndConditions.jsx`'s existing embedded "6. Privacy Policy" bullets into a standalone page. Flagged in-page as not legal advice — have it reviewed before treating as final.
- **FAQs/FAQs.jsx** (`/faqs`) — static accordion, 5 questions (shipping, returns, sizing, student discount, gift cards). No backend.
- **Affiliate/Affiliate.jsx** (`/affiliate`) — static info page + `mailto:` CTA, **not** the real request-submission flow. `AffiliatePartner`/`AffiliateRequest` models and the review flow are explicitly backend-only and later, per B.4 — this is a placeholder that beats a dead link, not the finished feature.

All 7 wired into `src/router/Router.jsx`, all public (outside the `AdminRoute`-guarded tree).

### Checkout: gift-card redemption
Mirrors the existing reward-points pattern exactly, per your "keep the redemption interface similar" instruction — bounded input → local state → folded into `onDiscountUpdate`'s payload → `CheckoutPage`'s `discountInfo` state → `orderData` at submit. Applied identically to both `OrderSummary.jsx` (desktop) and `MobileOrderSummary.jsx` (confirmed a near-byte-identical duplicate) — a new "GIFT CARD" section (code input + Apply button, or an applied-amount green line item with a remove button) sits next to the existing "REWARD POINTS" section in both. `handleApplyGiftCard` posts to `POST /api/gift-cards/validate`, clamps the applied amount to the smaller of the card's available balance and what's left of the subtotal after other discounts. `CheckoutPage.jsx`'s `discountInfo` state and `handleSubmitOrder`'s `orderData` object both gained `giftCardCode`/`giftCardAmount(Applied)` fields, alongside the pre-existing (still otherwise-dead) `discountCode` field.

### Verification
`npm run lint`: 62 pre-existing problems repo-wide, confirmed byte-identical (same file/line/rule) before and after this session's changes via a `git stash`/lint/`stash pop` comparison — **zero new lint issues** introduced by any file this session touched, including the three checkout files (which do show pre-existing unused-var errors, all unrelated to gift cards — traced and confirmed present in the pre-session version too).

**Sandbox disk I/O was severely degraded this session** — measured directly: raw sequential reads off `src/assets/` ran at roughly 380KB/s, versus the fast, unremarkable I/O every earlier session in this project reported. `npm run build` and `npm run dev` both sat at native, near-zero CPU usage for 10+ minutes before making visible progress (confirmed via `ps` CPU-time deltas and `lsof` — genuinely blocked on real file reads, not a hang or a deadlock). This is a sandbox-instance characteristic, not a code defect. Both eventually completed once given enough wall-clock time:
- `npm run build`: succeeded, **2451 modules, 0 errors**, only the pre-existing >500kB bundle-size warning (unchanged from prior sessions). Took 21m — abnormal only in duration, not outcome.
- **Live browser click-through, actually completed once the dev server came up**: desktop megamenu (Women, Men) opens correctly on hover as a 3-column panel at the right position; About STETH's 2-item dropdown works; all three panels correctly show "No colors/fabrics/categories yet" placeholder text rather than crashing or hanging on `loading` — because the frontend's `API_BASE_URL` falls back to the real production backend (no `.env.local` in this dev environment, same standing gap noted in the prior Auth/UX session), and that production backend genuinely 404s on `/api/fabrics`/`/api/categories`/`/api/colors` (confirmed directly: none of this project's backend work has ever been pushed/deployed there). This is the expected, already-documented environment limitation, not a frontend bug — the hook's error handling was confirmed correct (catches the failed fetch, sets `loading: false`, falls back to empty arrays, no crash, no infinite spinner). Footer: all 15 links inspected via DOM (`href` on every `<a>`) — Women/Men/Gift Cards/Our Story/Blog/Privacy Policy/Terms and Conditions/FAQs/My Orders/Student Program/Loyalty Program/Affiliate Program all point where expected, Instagram keeps its real URL, Facebook/TikTok are the confirmed placeholder `#` hrefs, copyright line rendered **"© 2026 STETH, INC."** confirming the `{new Date().getFullYear()}` fix. Spot-checked pages: `/gift-cards` (purchase form renders), `/blog` (empty-state "No posts yet" — same production-404 reason as above), `/privacy` (full content renders). Checkout: the new "GIFT CARD" section renders next to "REWARD POINTS" as designed; typed a code, clicked Apply, confirmed the fetch fires against `/api/gift-cards/validate`, the failure (same production-404 reason) is caught, and the UI shows the red **"Could not validate gift card right now"** message exactly as coded — proves the apply/error-handling wiring end-to-end, short of an actual valid code (which no reachable backend can issue this session).

### What's next
This session's build + click-through pass confirms the mechanism (megamenu positioning, footer links, gift-card apply flow) is wired correctly end-to-end. What's still unverified, because it needs a real backend that actually has this project's B.1/B.4 routes deployed: megamenu showing **real, non-empty** Fabric/Category/Color data and a "Shop By" click landing on an actually-filtered `/women`/`/men` grid; a full gift-card purchase → code → checkout redemption → balance-decrement round trip; blog posts actually listing once some exist. None of that is reachable until either a dev/staging backend is stood up or this session's backend commits get deployed. Blog admin CRUD screen and Affiliate's real request-flow are both intentionally deferred, tracked in the backend's PROGRESS.md. Real Facebook/TikTok URLs whenever available (currently placeholder `#` hrefs, confirmed with you).

---

## Session: Product page cluster — issues #11–#16 (2026-07-24)

All six items live in or near `DetailSection.jsx` (product detail) and the cart mechanism shared with `Header.jsx`/`Cart.jsx`. Plan mode was used for #16 (new drawer component, shared cart-event plumbing across three files) and #15 (new navigation behavior), per your instruction — approved plan at `~/.claude/plans/buzzing-cooking-pretzel.md`. #11–#14 were small, contained changes done directly without a plan.

### #11 — keyboard gallery nav
Added a `keydown` listener in a new `useEffect` in `DetailSection.jsx`, scoped to this component's own mount/unmount lifecycle (it's only ever rendered on the product-detail route, so this is never a page-wide listener the way a `Header.jsx`-level listener would be). ArrowLeft/ArrowRight call the existing `handleSlide('prev'/'next')` — the same animated index-advance function already driving the lightbox's arrow buttons, sharing its `currentImageIndex`/`displayImages` guard logic. Skips if focus is in a text input (defensive; this page has none today, but keeps the handler honest if one's added later). `handleSlide` is deliberately left out of the effect's dependency array with an explanatory comment — it's redeclared fresh every render from the same three values already listed, and it's declared later in the component, so listing it directly would hit the temporal dead zone at render time (confirmed by testing the naive fix first and catching the `ReferenceError` before it shipped).

### #12 — unified unavailable-size treatment
Found the actual bug behind "the label only shows in one of two paths": `isSizeAvailable` already returns `false` whenever stock is 0 (`item.stock > 0` is how the availability map is built in the first place), so the old `sizeAvailable && sizeStock === 0` condition guarding the "Out of stock" label could never be true — it was dead code, not a partially-working path. Replaced both size-button blocks (mobile and desktop layouts) with one `isUnavailable = !sizeAvailable || sizeStock === 0` used for everything: the dimming, a new muted gray fill + line-through on the size text (beyond opacity alone, per the ask), and the "Out of stock" label now shown unconditionally whenever unavailable.

### #13 — Size Chart button
Restyled from plain underlined text to a small outline pill (`border border-gray-300 rounded-full`, hover darkens to black) in both layouts — matches the language of the page's other small controls rather than reading as a link.

### #14 — add-to-cart confirmation, and its overlap with #16
Removed the old GSAP-animated green message box entirely (state, ref, and timeout logic) and replaced it with a brief on-button state: "Add to Bag" swaps to a green "ADDED ✓" for 2 seconds after a successful add.

**Deliberately did not add a toast/snackbar**, even though the literal ask was "toast/snackbar and a brief button state" — the session's own verification instruction flagged the tension directly ("toast AND drawer both popping is probably too much — decide"). Since #16's drawer opens on the same click and already shows the actual item just added (stronger and more specific confirmation than a generic toast message would be), firing a toast too would be a third simultaneous signal for one click. Kept: the on-button state (small, in-place, always visible regardless of drawer state) + the drawer opening (the "big" confirmation). This matches the master plan's own text for #14, which calls the drawer "itself strong confirmation."

### #15 — Shop Now button
`DetailSection.jsx` had genuinely dead code sitting exactly where this feature belonged: a `cartItems` state that was declared but never populated anywhere in the file (`setCartItems` was never called), and a `proceedToCheckout` function built around that always-empty state, never wired to any button. Removed both rather than leaving them as unreachable clutter once a real implementation existed.

Extracted the item-construction + `localStorage` write logic out of the old `validateAndAddToBag` into a shared `addItemToCart()` helper (returns the constructed item, or `null` on validation failure) — both "Add to Bag" and the new "Shop Now" button call it. Shop Now: `addItemToCart()` then `navigate('/checkout')` immediately, deliberately skipping the button success-state and the cart-drawer open, since the page is about to unmount — either would just flash and vanish before being visible. New outline "SHOP NOW" button added directly below "Add to Bag" in both mobile and desktop layouts.

Checked `CheckoutPage.jsx` before building this, per your explicit "tell me if checkout hard-requires something only settable from the full cart page" instruction: it doesn't. Cart items are read from `localStorage` synchronously on mount, and guest checkout is fully supported (`/create-guest` endpoint, no login gate) — confirmed via `Cart.jsx`'s existing guest-checkout branch and `CheckoutPage.jsx`'s `isLoggedIn` branching in `handleSubmitOrder`. No reason to deviate from the stated interpretation.

**Incidental bug fixed in passing, not introduced**: the old `validateAndAddToBag` pushed the identical `add_to_cart` GTM `dataLayer` event twice per real add (once before the `localStorage` write, once again after) — every add-to-cart was double-counted in GTM/Meta analytics. Fixed as part of the `addItemToCart()` extraction (one push per add) since it was directly in the code already being rewritten for #15 — not a separate unrelated change.

### #16 — cart preview drawer
New `src/context/CartDrawerContext.jsx` (`isOpen`/`openCartDrawer`/`closeCartDrawer`) + `src/components/CartDrawer/CartDrawer.jsx`, mounted once at the `App.jsx` root as a sibling to `<AppRouter/>` — deliberately mirrors the existing `AuthPanel.jsx`/`AuthContext`'s `authPanel` pattern exactly, since that's how this codebase already solves "a slide-over panel needs to open from component trees that don't nest" (`Header.jsx` has no shared app shell and remounts per route, confirmed in the Auth/UX session). The drawer's **open/closed state** is the only new state introduced; the **cart items it shows** are read straight from `localStorage` and refreshed via the pre-existing `cartUpdated` event — the same mechanism `Header.jsx`'s cart-count badge and `Cart.jsx` already use, per `CLAUDE.md`'s explicit "don't invent a second cart-state mechanism" note. Quantity +/− and remove inside the drawer write back through that same event, so the drawer and `/cart` never drift apart.

Opens on: the "Add to Bag" success path (`DetailSection.jsx`), and the cart icon anchors in `Header.jsx` (desktop nav icon + mobile top-bar icon — both `preventDefault()` and call `openCartDrawer()` instead of navigating). Left as a plain link to `/cart`: the "CART" text row inside the full-screen mobile menu overlay — stacking the drawer on top of that already-open overlay would be confusing, so that one specific entry point was deliberately excluded, per the plan.

### Verification
`npm run lint` (all touched/new files + full project): confirmed via `git stash` before/after comparison — baseline was 62 problems (43 errors, 19 warnings), now 61 (41 errors, 20 warnings). Net **−2 errors** (the `setCartItems`/`proceedToCheckout` dead-code removal from #15 actually fixed two pre-existing lint errors), **+1 warning** (`CartDrawerContext.jsx`'s `react-refresh/only-export-components`, which is the exact same warning already accepted on `AuthContext.jsx` for the identical reason — a context file exporting both the provider and a hook). Zero new errors anywhere.

`npm run build`: succeeded clean, **2453 modules, 0 errors**, only the pre-existing bundle-size warning — matching the established bar (took ~43 minutes under this session's throttled sandbox I/O, confirmed abnormal only in duration once the concurrent, contending `npm run dev` process was stopped).

**Live browser click-through — partial, and here's the honest breakdown of what did and didn't get confirmed.** This session's sandbox exhibited a *different* failure mode than the prior session's straightforward slow-I/O: after the dev server came up, it entered a pattern of spontaneous full-page remounts/blanking mid-interaction — confirmed via console logs showing repeated `[vite] hot updated: ...` cycles and duplicate `Product ID from URL params` / `Making API request` log lines with no code change of mine triggering them, alongside a `[vite] failed to connect to websocket` HMR error. Confirmed this wasn't specific to my new code: a plain, pre-existing, unmodified thumbnail click (`onClick={() => setCurrentImageIndex(index)}`) failed to update the main image in the same way my new keyboard handler did, under the same conditions — ruling out a bug in this session's changes specifically. Killing a concurrently-running `npm run build` (contending for the same throttled I/O, same root cause as last session) reduced but didn't eliminate the instability.

What I did get a clean, stable render of before the instability set in: the desktop product page at 1600px width showing `SIZE` with the S size correctly muted/gray/line-through with a red "Out of stock" label (#12), the `Size Chart` pill button in its new outline style (#13), and the new outline "SHOP NOW" button directly under the black "ADD TO BAG" button (#15) — all three confirmed visually in a stable screenshot, not just by reading the code. What I was not able to get a stable interactive click-through of before running out of reasonable attempts: keyboard arrow gallery nav, the add-to-cart button state + drawer opening together, the drawer's quantity/remove controls staying in sync with `/cart`, and Shop Now's immediate navigation. For all of these, the fallback is a manual code trace (documented above, item by item) plus the clean lint/build results — matching this project's established practice of disclosing sandbox limitations honestly rather than claiming an interactive pass that didn't actually complete.

### What's next
Retry the full interactive click-through (keyboard nav, add-to-cart → drawer, drawer quantity sync with `/cart`, Shop Now → checkout) once a stable dev-server session is available — this is a real, not-yet-closed verification gap, not a formality. Both viewports (375px mobile, desktop ≥1400px) still need checking; only desktop was reached before the instability. If the HMR-remount pattern recurs in a future session, it's worth checking whether it's this sandbox's WebSocket proxying specifically (the console error named that directly) rather than assuming it's the same root cause as the slow-I/O pattern from the prior session.

---

## Session: Checkout/account cluster — issues #17, #18, #20 (2026-07-24)

Confirmed prerequisites A1/A4 were already done (per the backend's `PROGRESS.md`) before starting. Plan mode was used for the `statusHistory` schema handling and the account-overlay routing/layout restructure, per your instruction.

**Correction to the master plan's own text, worth flagging**: issue #18 describes linking "For You" toward "the rewards page, which doesn't exist yet" — it does now (`/rewards`, a Coming Soon placeholder built in the navbar/footer session). Linked there instead of nowhere.

**Contact-us decision (your call, per the brief)**: a `mailto:` link with the order ID in the subject, matching the exact pattern `Affiliate.jsx` already uses — not a new support-form endpoint.

### #17
One-line label change, `CheckoutPage.jsx`: "Pay now" → "Checkout".

### #18 — account overlay
Same architecture as the two existing slide-overs (`AuthPanel`/`AuthContext`, `CartDrawer`/`CartDrawerContext`) — a new `AccountContext.jsx` (`isOpen`/`activeTab`/`openAccountOverlay(tab)`) mounted at the `App.jsx` root alongside the other two, and `AccountOverlay.jsx` (right-side slide-over, same `AnimatePresence`+backdrop+Escape+scroll-lock shell as `CartDrawer.jsx`). Three tabs: **For You** (placeholder linking to `/rewards`), **Orders** (fetches `GET /api/orders/my-orders`, compact cards expanding to show the `statusHistory` timeline, a Cancel Order button rendered only when `orderStatus` is `Pending`/`Processing` — mirrors the backend's own eligibility check so the button is never shown in a state where clicking it would just 400 — and the `mailto:` contact link), **Profile** (same info the old `Profile.jsx` showed: avatar, username, email, reward points, logout — deliberately not adding a new username/password-edit form here, that wasn't asked for).

Opening the overlay while logged out calls `openAuthPanel('login')` instead of showing an empty account view.

**Routing**: `Profile.jsx` (the old full-page version) is deleted outright, the same way `Login.jsx`/`SignUp.jsx` were retired when `AuthPanel` replaced them. `/profile` stays registered purely for back-compat, now pointing at a new `AccountRedirect.jsx` (mirrors `AuthRedirect.jsx` exactly — opens the overlay, redirects to `/`). `Header.jsx`'s profile icon (desktop + mobile menu) and `Footer.jsx`'s "My Orders" link both convert from `<a href="/profile">` navigation to handlers calling `openAccountOverlay()` directly, guarding on `isLoggedIn` the same way the cart icon already does.

### #20 — checkout prefill + save-address
`ContactForm.jsx` was already fetching the user's profile on mount to prefill name/email (confirmed while researching this — the actual gap was narrower than the plan doc implied). `DeliveryForm.jsx` gets the same profile-fetch pattern added: finds `addresses.find(a => a.isDefault)`, falling back to the last array entry if none is flagged default, prefills `address`/`city`. No-op for guests (same `if (!token) return` guard `ContactForm` already uses) and for logged-in users with an empty `addresses` array (nothing found, form stays blank).

**Bug caught and fixed during implementation, not shipped**: the prefill effect's `setFormData` call didn't originally notify the parent (`CheckoutPage`'s `checkoutDetails`) — meaning a user who submitted without touching the visibly-prefilled fields would have failed checkout validation against the parent's still-empty state, despite the form looking correctly filled in. Fixed by having the prefill effect call the same `notifyParent` the manual-edit path already uses.

New "Save this address to my profile" checkbox in `DeliveryForm.jsx`, shown only when logged in, riding along in the existing `onDeliveryInfoChange` payload as `saveAddress`. `CheckoutPage.jsx`'s `handleSubmitOrder` fires a follow-up `PUT /api/users/update-account` after the order itself has already succeeded, wrapped in its own try/catch so a failure there never affects the (already-successful) order — this is a profile nicety, not part of the checkout transaction.

### A near-miss worth recording
Mid-session, a `git stash` issued as part of a lint-baseline comparison (matching a pattern used successfully in earlier sessions) hit this machine's own resource contention (several other apps running — VS Code, another AI coding tool, the Claude desktop app itself) and the whole command chain was killed by a timeout **before the matching `git stash pop` could run**, leaving this session's uncommitted work stashed. Caught immediately via `git status`/`git stash list`, confirmed the stash still existed un-dropped, and recovered cleanly (`git stash pop`, verified file-by-file against the stash diff before dropping it) — no work was actually lost, but it's worth noting `git stash` for lint-comparison purposes is riskier on a loaded machine than it looked in earlier sessions, and is avoided for the rest of this entry's verification below in favor of `git show HEAD:<path>` (read-only, no working-tree mutation).

### Verification
`npm run lint`: clean across every touched/new file. One real error caught and fixed during the session (not shipped): `AccountOverlay.jsx`'s tab-icon `.map()` used a renamed destructure (`icon: Icon`) that ESLint's `no-unused-vars` flagged despite the JSX clearly using it — restructured to a plain `const TabIcon = tab.icon` inside the callback body, which resolved it cleanly (likely a rule-detection quirk with that specific destructure-rename-in-JSX pattern, not a real dead-code issue). Remaining warnings/errors are all pre-existing and confirmed unrelated: `CheckoutPage.jsx`'s three unused-var errors (present in every lint sweep of this file across every session so far), `DeliveryForm.jsx`'s missing-dependency warning (the effect it flags was untouched — I only added a second, separate effect), and `AccountContext.jsx`'s fast-refresh warning (the same one already accepted on `AuthContext.jsx`/`CartDrawerContext.jsx` for the identical reason).

`npm run build`: succeeded clean, only the pre-existing bundle-size warning.

**Live browser click-through was not completed this session.** After the build finished, both the Browser-pane tooling and, separately, the dev server itself became unresponsive (a plain `curl` to `localhost:3000` timed out, and shortly after even a local `node --check`/`wc -l` on unrelated files timed out) — this traces to the machine being genuinely under load from several other concurrently-running applications, not a code issue. Static verification (clean lint, clean build, and a careful manual trace of `DeliveryForm.jsx`'s prefill/save-address flow and `AccountOverlay.jsx`'s tab/timeline/cancel-eligibility logic against the backend's actual response shapes) is what's actually been done here — disclosed plainly rather than claimed as a live pass that didn't happen.

### What's next
Live-verify once a stable session is available: checkout prefill for a real logged-in user with/without a saved address, and for a guest; the save-address checkbox round-tripping through to `GET /api/users/profile`; the account overlay opening from all three entry points (Header desktop icon, Header mobile menu, Footer "My Orders") at both viewports; the Orders tab against real order data with a real `statusHistory` (needs the backend's own live-DB gap closed first, per its `PROGRESS.md`); Cancel Order's eligibility gating against a real `Shipped`/`Delivered` order. `Profile.jsx`'s removal means `/profile` no longer renders a page directly — confirm no other code still imports it directly (checked via grep at deletion time, found none, but worth a final look once the dev server is reachable again).

---

## Session: Order management admin UI + tracking — Part B.1's order workflow (2026-07-24)

Backend half of this session (statusHistory-adjacent bugfix, label endpoints, bulk endpoints) is documented in the backend's own `PROGRESS.md`. This entry covers the admin dashboard rewrite. Plan mode was used for the state machine and label-generation architecture, per your instruction — the state machine matches your brief and the master plan's own recommendation exactly, no correction needed.

### `OrdersList.jsx` — full rewrite, same route
Replaced the old single flat, paginated table (every status mixed together, only a "Details" link) with a six-tab dashboard (`Pending`/`Confirmed`/`Processing`/`Shipped`/`Delivered`/`Cancelled`) using the already-ported shadcn `Tabs` (`src/components/ui/tabs.jsx`). Each tab fetches `GET /api/orders/all?status=<Tab>` independently and caches its own orders/pagination/loading state, so switching tabs doesn't refetch data already loaded. No shadcn `Checkbox` was ported in Phase 3, so row/select-all checkboxes are plain native `<input type="checkbox">`, matching the pattern already used this session's earlier work (`DeliveryForm.jsx`'s save-address checkbox).

Per-tab row actions, driven by one `TAB_CONFIG` object rather than duplicated per-tab JSX:
- **Pending**: Confirm, Cancel.
- **Confirmed**: Print Label (single), Shipped (direct shortcut, skips Processing) — plus **Print All Labels** at the tab's top, independent of row selection, targeting every order currently in the tab.
- **Processing**: Shipped.
- **Shipped**: Deliver.
- **Delivered / Cancelled**: read-only, no actions, no checkboxes.

Selection (a `Set` of order IDs) resets on tab switch. A bulk-action bar appears above the table whenever selection is non-empty, offering whichever actions `TAB_CONFIG` says are valid for the active tab — calling the new `bulk-update-status` or `bulk-generate-labels` endpoints depending on the action.

`OrderUpdateStatus.jsx` (the per-order detail/manual-override screen, reached via each row's existing "Details" link) is untouched — still a valid escape hatch alongside the new tab flow, not a duplicate of it.

**No changes needed in `AccountOverlay.jsx`** (the customer-facing tracking timeline, built last session) — it already renders generically from whatever `statusHistory` contains and already covers all six statuses in its color map. New transitions from either the admin tabs or the label endpoint show up there automatically; this session's remaining verification gap is confirming that live, not building anything new there.

### Verification
`npm run lint`: clean on `OrdersList.jsx`, first attempt.

`npm run build`: succeeded, only the pre-existing bundle-size warning.

**Live browser click-through wasn't completed this session** — same standing sandbox limitation as the backend side: no reachable dev/staging database to place a real order against, and the production backend has none of this project's work deployed to it. Static verification (clean lint, clean build, and a careful manual trace of `TAB_CONFIG`'s row/bulk actions against the backend's actual endpoint contracts) is what's actually been done here.

### What's next
Once a reachable backend exists: walk a real order through every tab via the new UI, confirm the account overlay's timeline reflects each transition live, confirm bulk select/select-all works across at least two orders in one tab (per your explicit verification ask), confirm "Print All Labels" actually opens each generated PDF and that a partial-failure batch still shows the successful ones. Consider whether `OrdersList.jsx`'s per-tab fetch-and-cache approach needs a manual refresh affordance if an order's status changes from a different browser tab/admin session while this one is open - not built this session, since it wasn't asked for and the existing screens don't have this either.
