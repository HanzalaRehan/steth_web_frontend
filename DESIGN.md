# STETH Design System — Extracted from the working storefront

**Status: audit only, no functional/UI changes made in this session.**

This document extracts and records the design system that is *already in use* on the original, pre-overhaul storefront pages (Homepage, Women's/Men's catalog, Header/Footer, product grid, promo modal). It is not a new design system — it's what's actually shipping today on the pages that look and read correctly. Every session after this one should treat this file as the source of truth when bringing the newer screens (built across sessions 2–12: the `/admin` section, cart drawer, account overlay, auth panel) into line.

## How this was produced
Verified live in a running instance of the Vite dev server (`localhost:3000`) using the Browser preview tooling — homepage, `/women`, `/cart`, and the auth (login) slide-over panel were all rendered and inspected directly (computed styles pulled via `getComputedStyle`, not guessed from source). The `/admin/*` interior screens could not be reached the same way — they sit behind `AdminRoute`, and no admin credentials were available in this sandbox (login redirected correctly to the auth panel, confirming the guard works, but nothing past it was rendered). Everything reported below about the admin section's *token values* (colors, radius) comes from directly reading `tailwind.config.js`, `src/index.css`, and the shadcn component source under `src/components/ui/`, which is what actually produces the classes those screens render with — not a guess at what "looks wrong" from a screenshot that couldn't be taken. Where a claim is code-derived rather than visually confirmed, it's marked **(code)** below.

---

## 1. Color palette

### Storefront (source of truth)
Real, verified-in-browser values:

| Role | Value | Where |
|---|---|---|
| Primary text / buttons | `#000000` (black) | Nav "Login" button (`bg-black`), "SHOP MEN" hero button, product prices, headings |
| Primary surface | `#FFFFFF` (white) | Page background, product cards, modal |
| Body/secondary text | `rgb(55, 65, 81)` → Tailwind `text-gray-700` | Nav links ("Women", "Men") |
| Heading text | `rgb(31, 41, 55)` → Tailwind `text-gray-800` | Section headings ("Rewards & Exclusive Benefits") |
| Muted/section background | `bg-gray-50` / `bg-gray-200` | Product image tiles, color-tile carousel backdrop |
| Brand navy (limited use) | `navy-blue` custom token: `DEFAULT #1a237e`, `dark #121858`, `light #534bae` **(code, `tailwind.config.js`)** | Used in exactly **one** file (`src/components/Header.jsx`) — not a dominant color despite being a named theme token |
| Dark accent card | `rgb(11, 19, 43)` = `#0B132B` | "Rewards & Exclusive Benefits" feature cards (dark navy/charcoal cards on an otherwise all-white page — the storefront's only intentional dark-surface pattern) |
| Success indicator | Green checkmarks (Tailwind `text-green-*`, exact shade not sampled) | Rewards card bullet lists |
| Font color leak (bug, not a token) | `rgb(100, 108, 255)` = `#646cff` | See Mismatches #5 — leftover Vite template default, not a real palette color |

**Currency/locale:** PKR throughout, e.g. "Rs.5999" — confirmed, not a color finding but relevant context for any component that renders price.

### `/admin/*` section — a completely separate palette **(code)**
`tailwind.config.js` itself documents this honestly in a comment: *"shadcn/ui theme (ported from Steth_admin_Panel), scoped in practice to the /admin/\* section - nothing in the storefront references these class names today."* The actual values, from `src/index.css`:

| CSS variable | HSL | Approx hex | Role |
|---|---|---|---|
| `--background` | `0 0% 3.9%` | `#0A0A0A` (near-black) | Admin shell background |
| `--foreground` | `0 0% 98%` | `#FAFAFA` | Admin text |
| `--card` | `0 0% 3.9%` | `#0A0A0A` | Card surfaces — same near-black as the page background |
| `--primary` | `20.5 90.2% 48.2%` | `#E85D25`-ish burnt orange | Primary accent / focus ring / active nav |
| `--secondary` / `--muted` / `--accent` / `--border` / `--input` | `12 6.5% 15.1%` | dark warm-gray `#282220`-ish | Secondary surfaces, borders, inputs |
| `--destructive` | `0 62.8% 30.6%` | dark red | Delete/destructive actions |
| `--radius` | `0.5rem` (8px) | — | Base corner radius for all shadcn components |

This is a **dark-mode, orange-accented** theme, applied to a storefront whose actual brand color is navy/black-on-white. `AdminLayout.jsx`'s root element is literally `<div className="min-h-screen bg-black text-white">` — confirmed by direct source read, not inferred.

**Internal inconsistency inside the admin section itself (code):** `Dashboard.jsx`'s stat cards mix light Material-style pastel icon chips (`bg-blue-100`, `bg-green-100`, `bg-purple-100`, `bg-amber-100` — colors authored for a *light* card) inside a shadcn `<Card>` whose own background resolves to near-black. That's not just a storefront-vs-admin mismatch — it's incoherent on its own terms.

---

## 2. Typography

- **Font family:** Poppins everywhere, both storefront and admin — set globally in `index.css` (`html { font-family: 'Poppins', sans-serif }` plus a `@layer base` rule), imported via Google Fonts. This one is already consistent across old and new work; nothing to fix here.
- **Weights in use:** 400 (body), 500 (nav links, buttons, product names), 700 (headings, prices).

| Element | Size | Weight | Verified as |
|---|---|---|---|
| Hero body copy | 20px | 400 | `text-xl` |
| Section heading (h2, e.g. "Rewards & Exclusive Benefits") | 36px | 700 | `text-4xl font-bold` |
| Nav links | 16px | 500 | `text-base font-medium` |
| Product name | 16px | 500 | `text-base font-medium` |
| Product price | 16px | 700 | `text-base font-bold` |
| Admin page title (`AdminLayout.jsx` `<h1>`) | — **(code)** | `text-xl lg:text-2xl font-bold` | Comparable weight/scale to storefront headings, just rendered white-on-black instead of black-on-white |

No documented line-height/letter-spacing customization found in `tailwind.config.js` — both sections rely on Tailwind's default type-scale line-heights, unmodified.

---

## 3. Spacing

No custom spacing scale — `tailwind.config.js`'s `theme.extend` does not touch `spacing` at all, so this is **stock Tailwind default scale** throughout (4px increments, `space-4` = 1rem, etc.), used consistently in both old and new code:

- Section vertical rhythm: `py-16` (64px) and `py-8` (32px) are the two dominant section paddings on the storefront (confirmed in `ColorTileCarousal.jsx` and the homepage section stack read from the live DOM).
- Card padding: `p-4` (16px) and `p-6` (24px) — `p-6` is shadcn's own default for `<CardHeader>`/`<CardContent>` **(code)**, `p-4` shows up on storefront promo cards and admin stat cards alike.
- Large vertical separators: `my-20` (80px) around the color-tile carousel.

No spacing mismatch found — this is the one dimension where old and new code already agree, because neither side customized Tailwind's defaults.

---

## 4. Component patterns

### Buttons — storefront (verified live)
- Primary CTA ("Login" nav button): `bg-black text-white`, **`border-radius: 6px`**, padding `8px 16px`, font `14px/500`, no shadow.
- Large hero CTAs ("Shop Women"/"Shop Men"): same black-fill or white-with-black-border pattern, larger padding.
- No visible box-shadow on any storefront button sampled.

### Buttons — shadcn/admin **(code, `src/components/ui/button.jsx`)**
```
rounded-md text-sm font-medium ... focus-visible:ring-2 focus-visible:ring-ring
default: "bg-[#f5f5f5] text-black hover:bg-[#eaeaea]"
```
Worth noting: whoever built this already **overrode** shadcn's normal default (which would be `bg-primary text-primary-foreground`, i.e. orange-on-white) to a neutral light-grey/black — that's a `rounded-md` (6px, matches storefront) button that's already reasonably close to the storefront's black-button pattern in isolation. The mismatch isn't really the `<Button>` primitive itself — it's the **container it sits in** (near-black `AdminLayout` shell, near-black `<Card>`), which the button-level override doesn't address.

### Cards
- **Storefront:** product cards are borderless, white background, image sits on a light gray tile (`bg-gray-100`-ish), no visible shadow; the one deliberate dark-surface pattern (Rewards cards) uses solid `#0B132B` with white text and green checkmarks, `rounded-*` corners, no border.
- **Admin `<Card>` primitive (code):** `rounded-lg border bg-card text-card-foreground shadow-sm` → 8px radius, `shadow-sm`, and a real 1px border (`border-input`/`--border` token, dark warm-gray) — storefront cards use none of border/shadow/radius-lg as a combination; they're plainer.

### Form inputs
- **Storefront/AuthPanel (verified live, the login slide-over reached via `/admin` redirect):** white background, light gray border, black leading icon (mail/lock), rounded pill-ish fields, black "Sign in" button spanning full width, secondary actions ("Forgot password?") rendered as a black rounded pill button rather than a plain link. **This one new component (the auth slide-over) is a rare case that already matches the storefront well** — worth calling out as a positive reference for what "done right" looks like for the next two sessions.
- **Admin `<Input>` primitive (code):** `rounded-md border border-input bg-background px-3 py-2` — `bg-background` resolves to near-black, so on an unstyled instance this is a dark input, not the light one the storefront/AuthPanel actually uses.

### Modals/drawers
- Storefront promo modal (verified live): white surface, rounded corners, dark circular close button (`✕` in a black circle, top-right, overlapping the card edge), backdrop dim over the page.
- Admin `<Dialog>` primitive **(code, `src/components/ui/dialog.jsx`)**: overlay + content follow shadcn's standard structure, close button styled via `hover:opacity-100 ... data-[state=open]:bg-accent` (dark-theme tokens) rather than the storefront's solid black circle.

---

## 5. Concrete mismatches (old vs. new)

1. **Admin shell is dark-mode with an orange accent; the storefront is light-mode black-on-white.** `AdminLayout.jsx`'s root is literally `bg-black text-white`; every admin page nested inside inherits shadcn's near-black `--background`/`--card` and orange `--primary` (`hsl(20.5 90.2% 48.2%)`). The storefront never uses either color. This is the single largest, most systemic mismatch — not a one-off styling slip, it's the base theme.
2. **Card treatment differs structurally, not just in color.** Storefront cards: no border, no shadow, plain white surface. Admin `<Card>`: `rounded-lg border shadow-sm` — a border and shadow combination the storefront never uses anywhere that was sampled.
3. **Admin Dashboard mixes light-theme pastel icon chips (`bg-blue-100` etc.) inside dark shadcn Cards** — inconsistent even within the admin section itself, independent of the storefront comparison.
4. **Form inputs invert light/dark between the two "new" surfaces that should match each other.** The AuthPanel's login form (new, session 2) is light — white background, gray border — matching the storefront well. The shadcn `<Input>` primitive used everywhere in `/admin/*` (also new, sessions 4a onward) is dark by default (`bg-background`). Two components built in the same overhaul, for the same underlying design language, ended up opposite.
5. **Leftover unstyled default creeping through on the Cart page.** The `/cart` page's breadcrumb ("Home / Checkout") renders in `rgb(100, 108, 255)` / `#646cff` — this is Vite's own scaffold default (`index.css`'s untouched `a { color: #646cff }` rule from the original `create-vite` template), not an intentional brand color. It's visibly bright blue-purple against a page that's otherwise strictly black/white/gray. The same rule exists on the homepage's logo link too, but is invisible there only because a child element happens to override it — the Cart breadcrumb has no such override, so the bug is exposed. Small, but concrete and easy to fix (either give the breadcrumb an explicit `text-black`/`text-gray-700`, or scope/remove the leftover scaffold `a` rule in `index.css`).
6. **Button radius/type scale are actually already close.** Not a mismatch to fix — noted so the next sessions don't over-correct: the shadcn `Button`'s `rounded-md` (6px) and the storefront's own black button radius (6px, measured) already agree, and Poppins/weight patterns already agree. The real gap is background/surface color and the border+shadow combination on cards, not the whole component vocabulary.

---

## Punch list — screens needing design alignment in the next two sessions

Grouped by repo/section. This is what Session 13/14 should work through; `PROGRESS.md` points here.

### `Steth_web_frontend` — `/admin/*` section (built sessions 4a–5, extended through session ~11)
All of these inherit the dark/orange shadcn theme documented above and need to be brought onto the storefront's light black-on-white palette (or a deliberately-designed light variant of the admin shell — that's a call for whoever picks this up, not decided here):

- `src/pages/Admin/AdminLayout.jsx` — the shell itself (`bg-black text-white` root, sidebar, header) — **fix this first**, since every page below inherits from it
- `src/pages/Admin/Dashboard/Dashboard.jsx` — stat cards (also has the internal pastel-on-dark inconsistency, #3 above)
- `src/pages/Admin/ProductManagement/` — `ProductManagementHub.jsx`, `ProductList.jsx`, `ProductAdd.jsx`, `ProductUpdate.jsx`, `ProductDelete.jsx`, `ProductImages.jsx`, `ProductUpdateImages.jsx`, `CustomersAlsoBought.jsx`, `CustomersAlsoBoughtEdit.jsx`
- `src/pages/Admin/StudentApproval/` — `StudentApprovalList.jsx`, `StudentApprovalDetail.jsx`
- `src/pages/Admin/Orders/` — `OrdersList.jsx`, `OrderUpdateStatus.jsx`
- `src/pages/Admin/HeroImages/HeroImages.jsx`
- `src/pages/Admin/ColorTiles/ColorTiles.jsx`
- `src/pages/Admin/Newsletter/Newsletter.jsx`
- `src/pages/Admin/Settings/Settings.jsx`
- `src/pages/Admin/Fabric/Fabric.jsx`
- `src/pages/Admin/Category/Category.jsx`
- `src/pages/Admin/Colors/Colors.jsx`
- `src/pages/Admin/Vendor/Vendor.jsx`
- `src/pages/Admin/Inventory/Inventory.jsx`
- `src/pages/Admin/DiscountCodes/DiscountCodes.jsx`
- `src/pages/Admin/Affiliates/Affiliates.jsx`
- `src/pages/Admin/Marketing/MarketingDashboard.jsx`
- `src/components/ui/*` (48 shadcn primitives ported in session 3) — the root-level fix: adjusting `--background`/`--card`/`--primary`/`--border`/`--input` in `src/index.css`'s `:root` block would cascade correctly to nearly everything above, since almost all of these pages compose the same primitives rather than hand-rolling their own colors

### `Steth_web_frontend` — new storefront-adjacent components (sessions 2, 8–9)
- `src/components/AuthPanel/` (`AuthPanel.jsx`, `LoginForm.jsx`, `SignupForm.jsx`, `VerifyOtpForm.jsx`) — **already close to on-brand** (see finding #4); mainly needs the shadcn `<Input>`/`<Button>` primitives it borrows from to stop defaulting dark, or to keep using its own overrides consistently
- `src/components/CartDrawer/CartDrawer.jsx` — not yet visually audited against the palette above (couldn't trigger it without a populated cart in this session) — needs a look in the next session
- `src/components/AccountOverlay/AccountOverlay.jsx` — same: not yet visually audited, needs login to reach; check against this palette next session
- `src/pages/Cart/` (the full `/cart` page, not the drawer) — has the `#646cff` breadcrumb-color bug (mismatch #5) and hasn't been fully re-screened otherwise

### `Steth_web_backend`
No design-system work applies — backend has no UI. Nothing to add here.

### `Steth_admin_Panel`
Deprecated per existing project convention (superseded by `Steth_web_frontend`'s `/admin/*` section) — out of scope for this audit and the next two sessions unless that decision changes.

---

## Known gaps in this audit (disclosed, not silently skipped)
- `/admin/*` interior pages were reviewed via source code only, not rendered live — no admin credentials were available in this sandbox. The color-token findings above are high-confidence (read directly from the CSS/config that produces the rendered output), but exact spacing/layout on those specific screens should get a quick visual pass once someone with real credentials can log in.
- `CartDrawer` and `AccountOverlay` (both new, both slide-over panels) were not visually reached this session — flagged in the punch list above rather than guessed at.
- Product detail page (`DetailSection.jsx`) was not visually re-screened this session (time/scope), though it's one of the "original, good-looking" pages per prior sessions' work on it (keyboard nav, size-chart button, add-to-cart confirmation) — worth a quick confirmation pass, not a rebuild.
