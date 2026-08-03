# OmniChat AI — Ground-Up Redesign: Complete UI/UX Plan

This supersedes the previous theme entirely. Nothing carries over except the one hero background video. Every page, section, component, and motion pattern below is designed fresh, inspired by the current best-in-class AI chatbot/automation product category (Linear, Vercel, Intercom Fin, Decagon, Chatbase, Retell, Relay) rather than the sci-fi-terminal direction the old UI had.

---

## 0. Design Thesis

**Category read:** the best AI/automation products right now share a visual grammar — dark or near-neutral base, one confident accent, real product UI shown in-context (not abstract 3D blobs), generous whitespace, restrained motion, and copy that sounds like a person, not a system. The chatbot/automation category specifically also earns something most SaaS can't: **you can show the product actually working** — a live or simulated chat conversation is more convincing than any headline. That becomes a first-class design element here, not an afterthought icon.

**What makes this OmniChat, not a template:** the one asset you have that's genuinely yours is the hero video — machined hardware, cool light. Everything else in the system is intentionally quiet so that footage and the live-chat-demo pattern (section 7) are the two things people remember, instead of ten different decorative flourishes competing with each other.

**Audience:** SMB/mid-market e-commerce owners buying infrastructure. The bar is "would I trust this with my checkout," not "is this delightful." Confidence and clarity over spectacle.

---

## 1. The Video: One Asset, Two Jobs

You have one video. Use it deliberately, not everywhere:

- **Job 1 — Hero background (full treatment).** Full-bleed, autoplay muted loop, scroll-scrubbed on desktop (pinned section, video frame tied to scroll progress), simple autoplay loop on mobile (no scroll-scrub — see motion section). This is the one place it gets the full cinematic treatment.
- **Job 2 — Ambient system texture (lightweight, everywhere else).** Extract 2–3 still frames from the video and derive a subtle grain/gradient-orb background from its color grade (the cool blue/mint light) — use *that*, not the video itself, as a faint ambient background wash on other sections (Pricing, FAQ, Auth). This keeps the rest of the site fast (no repeated video decode cost) while visually rhyming with the hero. Never loop the actual video file more than once per page.
- **Do not** use the video as a literal global fixed background behind scrolling content — that fights legibility (as seen in the current auth screens) and tanks performance. The "global" feeling comes from the derived color/grain texture, not the literal footage repeating.

---

## 2. Color System

Dark-first (matches the category and the footage), single accent, one reserved secondary for state only.

| Token | Hex | Usage |
|---|---|---|
| `bg-base` | `#0A0A0C` | Page background |
| `bg-raised` | `#141417` | Cards, panels, dashboard surfaces |
| `bg-overlay` | `#1C1C20` | Modals, dropdowns, popovers |
| `border-subtle` | `rgba(255,255,255,0.08)` | Default dividers/card borders |
| `border-strong` | `rgba(255,255,255,0.16)` | Hover/focus/active borders |
| `text-primary` | `#F7F7F8` | Headings, primary copy |
| `text-secondary` | `#9B9BA3` | Body copy, descriptions |
| `text-tertiary` | `#5C5C64` | Placeholder, disabled, timestamps |
| `accent` | `#5B8DEF` | The only action color: buttons, links, active states, focus rings |
| `accent-soft` | `rgba(91,141,239,0.12)` | Accent backgrounds, selected states |
| `accent-glow` | `rgba(91,141,239,0.35)` | Used only in the hero video overlay + glow effects, never on UI chrome |
| `state-success` | `#4ADE80` | Success only |
| `state-error` | `#F87171` | Error only |
| `state-warning` | `#FBBF24` | Warning only |

**Rule:** one accent color drives every interactive element in the product. State colors (success/error/warning) appear *only* in feedback contexts (toasts, form validation, status badges) — never as decoration. This single-accent discipline is what reads as "engineered by people who trust their product," which is exactly the tone an automation/infra tool needs.

**Light mode:** not recommended as a v1 scope — the category leans dark (Linear, Vercel, most AI tools default dark), and it halves the design/QA surface. Flag if a light mode is actually required by a customer segment; if so, it's a second pass after dark ships, not parallel work.

---

## 3. Typography

| Role | Face | Notes |
|---|---|---|
| Display/heading | **Geist** or **General Sans** | Geometric, confident, the current standard for this exact product category (Vercel's Geist is the closest reference point for "AI infra" typography right now) |
| Body/UI | **Inter** | Keep — already integrated, no risk, reads clean at UI sizes |
| Mono (data, code, chat timestamps) | **JetBrains Mono** or **Geist Mono** | Chat message metadata, API examples in `/docs`, dashboard table data |

### Scale

| Level | Size (desktop/mobile) | Weight | Line-height | Use |
|---|---|---|---|---|
| Eyebrow | 12px / 12px | 600, +0.08em tracking | 1.2 | Section kickers, badges |
| H1 | 72px / 40px | 700 | 1.02 | Hero only |
| H2 | 44px / 28px | 600 | 1.1 | Section headers |
| H3 | 24px / 20px | 600 | 1.25 | Card titles |
| Body-lg | 18px / 16px | 400 | 1.5 | Hero subtext, intros |
| Body | 16px / 15px | 400 | 1.6 | Standard copy |
| Small | 14px / 13px | 400 | 1.5 | Captions, form helper text |
| Mono | 13px / 13px | 500 | 1.4 | Data, code, chat metadata |

Max 3 weights per screen (400/600/700). No color used to imply hierarchy — size and weight only; color is reserved for state and accent.

---

## 4. Layout, Spacing, Radius

- **Base unit:** 4px, all spacing multiples of it (8/12/16/24/32/48/64/96).
- **Container widths:** marketing 1200px, dashboard 1440px (needs room for tables), full-bleed for hero only.
- **Radius:** `sm 8px` (inputs, badges) · `md 12px` (buttons) · `lg 16px` (cards) · `xl 24px` (modals, feature panels) · consistent scale, no oversized 32px+ radii from the old theme.
- **Grid:** 12-col desktop / 4-col mobile, 24px gutter.

---

## 5. Component Inventory & Hierarchy

**Level 1 — Page.** One hero moment per page max.

**Level 2 — Section.** Eyebrow + H2 + optional intro, on a calm `bg-base` (or the ambient texture from section 1, never the raw video).

**Level 3 — Panels.** One panel style used everywhere for consistency: `bg-raised`, `border-subtle`, `radius-lg`, no glassmorphism/blur by default — reserve blur for exactly one thing (modals/command palette backdrop), so it stays special instead of being the default treatment on every card like the old theme.

**Level 4 — Primitives** (full inventory to build):
- Buttons: primary, secondary, ghost, icon-only, destructive
- Inputs: text, select, textarea, checkbox, radio, toggle, search
- Badge/tag, Avatar, Tooltip
- Card: feature card, pricing card, testimonial card, blog/doc card
- **Chat bubble components** (user message, AI message, typing indicator, quick-reply chips) — this is new and central: the product's own chat UI becomes a reusable component shown live on the marketing site
- Accordion (FAQ), Tabs
- Modal, Toast, Command palette (`Cmd+K`)
- Table (dashboard), Stat card (dashboard), Sidebar nav (dashboard), Breadcrumb

---

## 6. Signature Element: the Live Chat Demo

Instead of the old theme's "edge-light sweep" motif, the signature recurring element across the marketing site is **an actual working chat interface**, styled with the Level-4 chat bubble components, that:
- Appears embedded in the hero (or directly below it) with a short, real, auto-playing conversation (e.g., a customer asking about a product, the AI checking stock, offering checkout) — typed out with a realistic typing indicator, not an instant reveal.
- Reappears, simplified (static screenshot-style, no autoplay), inside relevant feature cards ("Cognitive Routing," "Checkout-as-Code") to show *proof*, not just claim it.
- This does more for trust and "premium AI product" positioning than any abstract animation — it's the single highest-leverage design decision in this plan, because it's literally the product demonstrating itself.

---

## 7. Motion System

Register: **confident, quick, mechanical-precise** — matches "reliable infrastructure," not playful or slow-luxury.

### Tokens
- Entrance: `cubic-bezier(0.16, 1, 0.3, 1)` (expo-out), 400–600ms
- Exit: `cubic-bezier(0.7, 0, 0.84, 0)` (expo-in), 200–300ms — always faster than entrance, and always fully removes the element (`opacity: 0` + `pointer-events: none` + unmount if off-screen) so nothing lingers as a ghost between sections
- Micro-interaction (hover/press): `ease-out`, 120–180ms
- Stagger: 50ms between siblings

### Per-component hover/interaction

| Component | Hover/Focus | Timing |
|---|---|---|
| Primary button | Fill brightens slightly, 1.02 scale | 150ms |
| Secondary/ghost button | Border/background fades in from transparent | 150ms |
| Card (feature/pricing) | Lifts 4px, border → `border-strong`, subtle shadow | 200ms |
| Nav link | Text brightens, underline draws in | 180ms |
| Input | Border → `accent`, focus ring `accent-soft` | 150ms |
| Chat bubble (demo) | New message: slide up 8px + fade, typing indicator pulses (3-dot, 1.2s loop) | per-message stagger 300–600ms apart, mimicking real typing cadence |
| Dashboard table row | Background tint only, no scale/shadow | 100ms |
| Toast | Slide + fade from top-right | 250ms in / 180ms out |
| Modal / command palette | Scale 0.97→1 + fade, backdrop blur fades in (the one place blur is used) | 200ms |

### Hero sequence (the one big moment)
1. 0–400ms: video fades in, opacity only.
2. 300–700ms: eyebrow label fades up.
3. 500–1000ms: H1 settles (word-level stagger if split, not character-level).
4. 800–1200ms: subtext fades up.
5. 1000–1600ms: chat demo widget appears (scale + fade), then begins its own auto-play conversation loop.
6. 1500ms+: video's scroll-scrub becomes the only active motion until the next section; text and chat demo are static once settled — no simultaneous competing motion during scroll (this is the direct fix for the old "everything moves at once" problem).

### Non-negotiables
- `prefers-reduced-motion`: hero degrades to a static frame + simple fade, chat demo shows its final state immediately instead of auto-typing.
- 60fps floor — transform/opacity only for anything scroll-linked.
- Mobile: no scroll-scrubbed video pinning — simple autoplay loop instead; chat demo still auto-plays (it's cheap — just text/CSS) since that's mobile-friendly by nature.
- Nothing blocks scrolling, clicking, or reading during any entrance.

---

## 8. Page-by-Page Plan

### Home / Landing
1. **Nav** — logo, Features/Pricing/Docs/About links, Log in, primary CTA.
2. **Hero** — H1 + subtext + CTA, video background (Job 1), live chat demo widget (signature element) embedded beside or below the headline.
3. **Social proof strip** — logos of platforms integrated with (WooCommerce, WhatsApp, etc.), quiet, single row, grayscale-to-color on hover.
4. **Feature grid ("Neural Capabilities")** — bento-style grid (mixed card sizes, not uniform 3-up), each card gets a small static chat-demo screenshot as proof where relevant.
5. **"How it works"** — 3–4 step horizontal or vertical sequence, numbered only because it's an actual sequence (per the frontend-design principle — numbering here is legitimate, unlike decorative 01/02/03).
6. **Total Awareness (positioning section)** — H2 + body copy on calm background with the ambient texture (Job 2 of the video), no competing imagery behind the text this time.
7. **Pricing** — 3 tiers, equal visual craft, accent-color emphasis (not a different card style) on the recommended tier.
8. **Testimonial/case study** — if you have real customer quotes; skip entirely rather than using placeholder quotes.
9. **FAQ** — accordion, Level-3 panel style, mono eyebrow.
10. **Final CTA** — short, one line, one button, quiet background.
11. **Footer** — links, social, legal.

### /docs
Left sidebar nav (mirrors dashboard sidebar pattern for consistency), main content area using the same type scale, code blocks in mono face with `bg-raised` background.

### /embed
Minimal chrome — this loads inside a customer's iframe, so it should be *just* the chat widget itself, no nav/footer, using the same chat bubble components as the hero demo for brand consistency between marketing and product.

### Auth (login, register, forgot-password, verify)
Level-3 panel centered on the ambient-texture background (never the raw video), plain-language copy (already fixed in the earlier pass — carries forward), standard button/input components from section 5, no special motion beyond a simple entrance fade.

### Dashboard (all roles)
Sidebar (collapsible) + top bar with search/`Cmd+K` + main content. Flat `bg-raised` panels only, no video/glass — table-first for lists (Projects, Conversations, Knowledge), stat cards used sparingly (3–4 max per page) at the top of Overview/Analytics. Mono face for all data values. Toast system for feedback (replacing any remaining `alert()` calls). Admin view adds Tenants/Billing/System Health sections to the same shell, with a persistent "Viewing as" indicator when impersonating a tenant.

---

## 9. Accessibility & Performance Floor

- WCAG AA (4.5:1) contrast for all text, checked against both `bg-base` and `bg-raised`.
- Visible keyboard focus rings (`accent`, 2px) on every interactive element, no focus-outline removal.
- Video: muted, has a pause control, respects reduced-motion, lazy-loads/doesn't block first paint.
- Chat demo auto-play: pausable, doesn't restart aggressively on scroll-back (once-per-session is enough).
- All dashboard tables keyboard-navigable, all forms have proper label associations.

---

## 10. Build Order

1. Strip old theme: remove sci-fi copy remnants, old glass-everywhere treatment, old color tokens — replace with section 2–4's system as CSS variables/Tailwind theme.
2. Build Level-4 primitives (button, input, card, badge) once, correctly — everything else assembles from these.
3. Build the chat bubble component set (section 6) — this is the highest-leverage new element and should exist early so it can be reused in both the hero and feature cards.
4. Rebuild Hero with the video (Job 1) + new sequence (section 7) + chat demo.
5. Rebuild remaining marketing sections (Features, Pricing, FAQ, Auth) on the new primitives and ambient texture (Job 2 of the video).
6. Build dashboard shell (sidebar, command palette, table, stat card) on the same tokens, flat-panel variant.
7. Full reduced-motion + mobile + contrast pass across everything.