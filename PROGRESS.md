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

`ProductImages.jsx` (the image-upload screen shown right after creating a product) gets a new panel, shown only when the product's gender is `Unisex`: per-color Men/Women image-set upload, hitting a new backend endpoint (`POST /:id/images/variant/:color/:gender`) that writes into `Product.variants` rather than the existing `colorImages`.

**Scope call, not done:** `ProductUpdateImages.jsx` — the separate, narrower screen for uploading images to colors newly added during a product *update* (not creation) — was **not** extended with the same per-gender panel. It only receives the newly-added colors via route state, not the product's gender, and wiring that through was judged lower-value than the primary create-flow screen every new product actually goes through. If a Unisex product needs per-gender images added to a color introduced after initial creation, that has to go through direct API calls today, not this screen. Flag if you want this closed.

### Verification
`npm run lint`: 0 errors/warnings in every file touched this session (confirmed via `grep` against the full lint run's output — the 68 pre-existing issues elsewhere in the repo are all in files this session never opened). `npm run build`: succeeded, 2075 modules (up from 2070 in the prior session), only the pre-existing >500kB bundle-size warning. Live click-through against the running admin UI wasn't done — same sandbox DB-connectivity gap as the backend (see its PROGRESS.md); static verification (lint + build + manual trace against the confirmed backend response shapes) is what's actually been done here.

### What's next
Optional: extend `ProductUpdateImages.jsx` with the same per-gender variant panel if that gap above turns out to matter in practice. Widening `AdminRoute` for `warehouse_manager` if you want that role to actually reach Vendor/Shipment/Inventory, per the gap flagged above. Otherwise, next per the master plan is the auth/UX cluster (login/signup rebuild, header rebuild) and navbar/footer rebuild.
