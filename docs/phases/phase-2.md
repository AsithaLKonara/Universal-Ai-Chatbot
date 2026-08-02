# Phase 2: Complete UI/UX Reverse Engineering

## 1. Complete UI Inventory

| Page / Component | Path | Purpose | Target User | Expected Actions |
| :--- | :--- | :--- | :--- | :--- |
| **Landing Page** | `/src/app/page.tsx` | Marketing & Value Proposition. | Prospective Enterprise Customers | Read features, view pricing, click "Initialize Node" to register. |
| **Login Page** | `/src/app/login/page.tsx` | User authentication. | Existing Customers | Enter credentials, recover password, or navigate to registration. |
| **Dashboard** | `/src/app/dashboard/page.tsx` | Core command center for tenant management. | Authenticated Admins / Owners | Create projects, view analytics, manage RAG knowledge, view chat logs. |
| **Chat Widget** | `/src/components/chat-widget.tsx` | The primary end-user conversational interface. | Shoppers / End-Users | Ask questions, view products, add to cart, trigger checkout. |
| **Nano UI System** | `/src/components/ui-nano.tsx` | Shared visual components (Navbar, Cards, Footer). | N/A | N/A (Structural) |

## 2. UX Audit Report

**Landing Page (`page.tsx`)**
- **Current Implementation:** Highly polished. Utilizes `lenis` for smooth scrolling, `framer-motion` for scroll-linked animations, and a GPU-accelerated canvas background.
- **UX Problems:** The canvas sequence (`useCanvasSequence`) loading 403 frames can be heavily taxing on mobile devices and low-end GPUs, potentially causing severe battery drain and jank.
- **Missing Features:** Interactive product tour or sandbox. Users must create an account to see the actual dashboard.

**Authentication (`login/page.tsx`)**
- **Current Implementation:** Clean, centered glassmorphic card. Uses `localStorage` for JWT storage and handles basic error states.
- **UX Problems:** Password visibility toggle is missing. No "Remember Me" functionality.
- **Missing Features:** OAuth/Social Login (Google, GitHub) is completely absent, which is standard for modern SaaS.

**Dashboard (`dashboard/page.tsx`)**
- **Current Implementation:** A Single Page Application (SPA) feel built inside a single Next.js route, using React `useState` (`tab`) to switch between Overview, Projects, Knowledge, and Logs.
- **UX Problems:**
  - **No Deep Linking:** Because tabs are managed via state instead of URL routes (e.g., `/dashboard/projects`), users cannot bookmark specific views or use the browser's back button effectively.
  - **Monolithic State:** A single 700+ line file manages fetching and rendering for all tabs. If a user switches tabs, state might be lost or redundantly re-fetched.
- **Missing Features:** Pagination on the knowledge base. Advanced filtering for conversation logs.

**Chat Widget (`chat-widget.tsx`)**
- **Current Implementation:** A floating, blur-heavy (`backdropFilter: "blur(32px)"`) widget. Uses SSE (Server-Sent Events) for real-time streaming and `react-markdown` for rich text.
- **UX Problems:** The `sessionId` is currently hardcoded to `"guest_session"`, meaning all unauthenticated users currently share or overwrite the same conversational context in the demo state.
- **Accessibility:** Lacks explicit `aria-labels` on icon-only buttons, failing basic screen reader compliance.

## 3. Design System Analysis

The application employs a custom **"Nano Design System"** built on top of Tailwind CSS v4.

- **Aesthetics:** "Synthetic Intelligence Aesthetics" (Glassmorphism). Heavy use of translucent backgrounds (`bg-white/[0.03]`), borders (`border-white/10`), and deep background blurs.
- **Color Palette:**
  - Background: Black (`#000000` / `#09090b`).
  - Text: Off-white (`#fafafa` / `text-white/60`).
  - Accent: Cobalt Blue (`#3b82f6`).
- **Typography:** Inter (Google Font), favoring uppercase, heavily tracked (`tracking-widest`), and heavily weighted (`font-black`) micro-copy to simulate a terminal/technical UI.

**Critique:** While visually stunning, the contrast ratios on placeholder text (`opacity-20`) and secondary text (`text-white/30`) likely fail WCAG AA accessibility standards.

## 4. Component Reusability Report

**Score: 3/10 (Poor)**

- **The Monolith Problem:** The dashboard (`dashboard/page.tsx`) is a massive 731-line monolith. The sidebar, metric cards, project lists, and knowledge input forms are all hardcoded into this single file.
- **Lack of Atomic Design:** The `ui-nano.tsx` file attempts to be a design system but bundles `Navbar`, `Section`, `NanoCard`, and `Footer` into a single file.
- **Recommendation:** The project desperately needs a standard component library structure using `class-variance-authority` (cva) for manageable variants.

## 5. Responsive Design Report

- **Desktop (1024px+):** Excellent. Hover states and animations are optimized for mouse interaction.
- **Tablet (768px - 1024px):** Good. The dashboard sidebar collapses into an icon-only view gracefully.
- **Mobile (< 768px):** Fair to Poor.
  - The Landing page hero text scales, but heavy canvas animations will cause performance degradation.
  - The Dashboard data tables and horizontal flex layouts may overflow on small screens.
  - The Chat Widget (`w-[380px]`) is fixed width and will overflow on small mobile devices (e.g., iPhone SE at 375px).
