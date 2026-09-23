# CLAUDE.md — Steth_web_frontend

## What this is
The customer-facing storefront. React 18 + Vite + React Router 7 + Tailwind, animation via GSAP and Framer Motion (both already installed — use Framer Motion for the new slide-over panels in the master plan, don't add a third animation library), carousels via Swiper (already installed — prefer it over hand-rolled slider logic). Deployed on Vercel. Talks to the backend at `https://steth-backend.onrender.com` — currently hardcoded as a literal string in **28 files**, not an env var. Fixing that is Part C, issue #1's job — don't add a 29th hardcoded occurrence while working on something else; use whatever central config that fix introduces, or if it hasn't landed yet, at minimum don't make the problem worse.

## Where we are
Active work plan: `stethset-unified-master-plan.md`. Check `PROGRESS.md` at the repo root before starting anything, update it at the end of every session (what changed, what's left in the current section, any judgment call you made where the plan was ambiguous — e.g. the "Shop Now" button behavior or the Confirmed/Processing order-status interpretation, both flagged as unresolved in the plan).

## Run / verify
- `npm run dev` — Vite dev server
- `npm run lint` — ESLint, run this before considering any change done
- `npm run build` — must succeed cleanly before calling a section finished
- There is no test setup in this repo at all currently. Don't assume `npm test` exists.

## Known landmines
- **Cart state lives entirely in `localStorage`**, coordinated across components (`Header.jsx`, `DetailSection.jsx`, `Cart.jsx`) via a custom `window.dispatchEvent(new Event('cartUpdated'))` / `window.addEventListener('cartUpdated', ...)` pattern. There is no backend cart entity. The cart-preview drawer (issue #16) should hook into this same event, not invent a second state mechanism — and don't quietly move the cart to a backend-backed model as a side effect of an unrelated task, that's a deliberate bigger decision.
- **Login/Signup are full routed pages that render the entire site `<Header/>` on top of the form** — this is the actual root cause of the viewport-overflow complaint (issue #5), not a form-sizing bug. When rebuilding these as a slide-over per the plan, don't just shrink the form; remove the redundant header render entirely.
- **`Header.jsx` has six-plus overlapping, hand-tuned pixel-range media queries** (770–880px, 1000–1110px, 1024–1284px, 1285–1400px, 1279–1535px, 1536px+) patched in reactively over time. When rebuilding the navbar (issue #23), don't add a seventh special case to the pile — replace the approach, don't extend it.
- **`ColorTileCarousal.jsx`'s clickable slides are `<div>`s with `onClick` and no `cursor-pointer`** (issue #3) — this pattern (onClick on a non-interactive element, no cursor affordance) is worth grepping for elsewhere in the codebase before assuming it's the only instance.
- **No route-transition wrapper exists anywhere in `router/Router.jsx`** despite `framer-motion` already being a dependency — issue #4's fix is additive, not a replacement of existing transition logic (there isn't any).
- **`DetailSection.jsx` (product detail) has full working image-gallery index logic but zero keyboard listeners** — issue #11's fix is a small addition to existing state, not a rewrite of the gallery.
- Currency is **PKR** throughout — don't introduce a different currency format or a currency-switcher assumption unless the plan explicitly asks for one.

## Conventions already in place
- Pages live under `src/pages/<PageName>/<PageName>.jsx` with a `Components/` subfolder for page-specific pieces; shared components live in `src/components/`. Follow this structure for new pages (e.g. Gift Cards, Blog, Privacy Policy from the footer rebuild).
- Routing is centralized in `src/router/Router.jsx` (imports every page, one `<Route>` per page) — add new routes there, don't scatter route definitions.
- Auth state is read directly from `localStorage.getItem("accessToken")` in multiple components rather than solely through `AuthContext.jsx` — check both when working on anything login-state-dependent, since not everything actually goes through the context.
- GSAP is the dominant animation library for existing pages (entrance animations, scroll parallax); Framer Motion is present but currently unused in most pages — the plan calls for Framer Motion specifically for the new slide-over panels (cart drawer, login/signup, account overlay), so that's an intentional addition, not an inconsistency to "fix" by converting everything to one library.

## Boundaries
- Don't modify anything under `src/assets/` casually — it's 19MB of real product imagery, not placeholders.
- Don't add a new HTTP client library — `axios` is already the one in use.
- Don't change `vercel.json`'s SPA rewrite rule as a side effect of unrelated routing work.
