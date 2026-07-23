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
