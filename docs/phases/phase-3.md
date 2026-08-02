# Phase 3: Complete System Architecture Understanding

## 1. Frontend Architecture
- **Framework & Routing:** Next.js 15 (App Router) using React 19. The application heavily relies on React Server Components (RSC) mixed with Client Components (`"use client"`) for interactivity (e.g., dashboard state, animations, chat widget).
- **State Management:** Currently relies primarily on localized React `useState` and standard prop-drilling. No robust global state management library (like Zustand or Redux) is overtly active in the core UI flows, which leads to monolithic files (like `dashboard/page.tsx`).
- **Component Architecture:** The UI is built on a custom "Nano Design System" leveraging Tailwind CSS v4, Framer Motion for micro-interactions, and GSAP/Lenis for smooth scrolling. 
- **Data Fetching:** Uses standard `fetch` against internal API routes with JWT bearer tokens.
- **Rendering Strategy:** The landing page utilizes edge rendering for fast TTI, while the dashboard is highly client-side dependent (loading spinners while fetching `/api/user/dashboard`).
- **Real-Time Strategy:** The chat widget uses Server-Sent Events (SSE) via `/api/stream` to stream LLM responses and UI updates incrementally.

## 2. Backend & Agentic Architecture
- **API Architecture:** Next.js API routes (`src/app/api/...`) act as the gateway. They are wrapped in observability middleware (`withObservability`) to trace requests using OpenTelemetry.
- **Orchestration Layer (`OrchestratorService`):** This is the brain of the backend. It processes inbound messages through a strict pipeline:
  1. **Intent Detection (`src/lib/intent.ts`):** Uses an LLM (Llama 3.1 8b) to classify the user's message into a strict JSON schema (e.g., `product_search`, `cart_add`).
  2. **Context Assembler:** Retrieves relevant tenant knowledge from the database (RAG) and combines it with conversation history.
  3. **Execution Supervisor (`src/lib/supervisor.ts`):** Acts as a security guardrail. It intercepts actions planned by the LLM and validates them against the tenant's safety policies (e.g., `maxDiscount`, `restrictedTools`) before execution.
  4. **Tool Engine:** Executes the approved actions (e.g., querying WooCommerce, creating Stripe sessions).
- **Event-Driven Bus:** Uses an internal event bus (`omniBus` / `events.ts`) to decouple asynchronous tasks like analytics tracking, billing calculations, and cognitive reflection from the main request-response cycle.

## 3. Database Architecture
- **Database & ORM:** PostgreSQL (hosted on Supabase) accessed via Prisma ORM.
- **Multi-Tenant Isolation Strategy:** An extremely robust implementation in `src/lib/prisma.ts`. It uses Node's `AsyncLocalStorage` to store the current `projectId`. Prisma is extended via middleware to automatically inject `where: { projectId }` on all queries and mutations, effectively preventing cross-tenant data leakage at the ORM level.
- **Vector Storage:** The `Knowledge` model uses the `pgvector` extension (`Unsupported("vector(1536)")`) to store embeddings for semantic similarity search.
- **Caching & Rate Limiting:** Utilizes Upstash Redis for semantic caching (`EmbeddingCache`) and sliding-window rate limiting (`ratelimit.ts`) on API routes.
- **Schema Highlights:**
  - `Project`: Tenant configurations and API keys.
  - `CheckoutSession`: A Finite State Machine (FSM) representation of the commerce loop.
  - `SystemEvent`: An idempotent ledger for tracking asynchronous webhooks and state transitions.

## 4. Infrastructure & Security Architecture
- **Deployment & Environments:** Designed for Vercel/Edge deployments, leveraging Edge-compatible libraries (Upstash, Next.js App Router).
- **Security:**
  - JWT for admin authentication.
  - Zod for rigorous input validation on all API endpoints.
  - Project API keys (`x-api-key`) for external SDK authentication.
  - Prisma client prevents raw SQL execution in production to secure the multi-tenant perimeter.
- **Observability:** Centralized logging (`logger.ts`) using Winston/Pino patterns, augmented by OpenTelemetry (`@opentelemetry/sdk-node`) for distributed tracing and correlation IDs (`x-correlation-id`).

---

### Phase 3 Conclusion
The system architecture is remarkably sophisticated, combining a robust multi-tenant data isolation strategy with a multi-layered LLM pipeline. The backend is enterprise-grade, utilizing event-driven patterns, guardrail supervisors, and strict idempotency. However, the frontend architecture lags behind in maturity, specifically in state management and component atomization.
