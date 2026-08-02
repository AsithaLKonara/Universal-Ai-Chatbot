# Phase 1: Project Discovery & Core Concept Understanding

## 1. Project Understanding Summary

**What is this product?**
Universal AI Chatbot SaaS (OmniChat AI) is a multi-tenant, enterprise-grade conversational orchestration platform. It is designed to act as an autonomous sales ecosystem rather than a standard rule-based chatbot.

**What business problem does it solve?**
It bridges the gap between traditional e-commerce and AI by providing a highly deterministic, context-aware agent that manages the entire buyer journey. It solves the unreliability (hallucinations, missed steps) of standard LLMs in commerce by enforcing a strict Finite State Machine (FSM) for checkout and utilizing a multi-stage cognitive pipeline to handle complex multi-vector product discovery and support.

**Who are the target users?**
- **B2B Customers:** E-commerce brand owners and enterprises (specifically WooCommerce users) looking to automate sales, support, and lower customer acquisition costs.
- **End-Users:** Everyday shoppers interacting with the brand via the Web SDK or WhatsApp.

**What are the main user journeys?**
1. **Multi-Vector Product Discovery:** Users searching for complex combinations of items via natural language.
2. **Deterministic Checkout Loop:** A strict flow progressing through Cart Review → Info Collection → Shipping Validation → Stripe Payment → WooCommerce Order Creation.
3. **Omnichannel Engagement:** Starting or continuing journeys seamlessly between the Web interface and WhatsApp Cloud API.
4. **Tenant Onboarding (B2B):** Project creation, credential injection (WooCommerce, Stripe, Meta API keys), and domain knowledge ingestion via RAG.

**What are the core features?**
- Unified Intelligence Orchestrator (Intent Detection, Planner, Supervisor).
- Deterministic Checkout FSM.
- RAG-based Knowledge System (Supabase `pgvector` indexing).
- Bidirectional WooCommerce Sync (Real-time inventory and order injection).
- Predictive Analytics (Abandonment risk, purchase intent scoring).

**What makes this product valuable?**
Its commitment to "context-autonomy" and "production hardening." Features like tenant-scoped vector isolation, guardrail supervisors, and strictly enforced FSM checkouts ensure that the AI cannot hallucinate prices or bypass payment loops.

**What is the intended enterprise/business model?**
A B2B SaaS model featuring metered billing, token-level spend tracking, and tiered subscriptions (Free, Pro, Enterprise) managed via Stripe.

**What should this product become in a production environment?**
A high-performance, edge-rendered, low-latency (sub-1.2s conversational round trip) cognitive platform that safely handles PII, processes payments at scale, and provides measurable AI ROI for merchants.

## 2. Architecture Understanding

**Frontend Architecture:**
- **Framework:** Next.js 15 (App Router) / React 19.
- **Language:** Strict Mode TypeScript.
- **Rendering:** React Server Components (RSC) and Streaming UI (Suspense) for optimistic, edge-rendered interfaces.
- **UI/UX:** "Nano Design System" utilizing Tailwind CSS v4, Framer Motion, and GSAP to deliver a premium "Glassmorphism" and "Synthetic Intelligence" aesthetic.

**Backend & Agentic Architecture:**
- **Infrastructure:** Next.js API Routes / Server Actions decoupled via an event-driven `omniBus` pattern.
- **Cognitive Pipeline:** A multi-layered intelligence engine utilizing Groq (Llama 3.3 70B) for inference.
- **Async Workers:** BullMQ for background job processing.

**Database & Data Layer:**
- **Primary DB:** PostgreSQL (via Supabase) with Prisma ORM.
- **Tenant Isolation:** Enforced via `projectId` relation mapping and Prisma middleware scoping.
- **Vector Storage:** Native `pgvector` for semantic knowledge retrieval.
- **Cache & Rate Limiting:** Upstash Redis (Serverless) for embedding caching and rate-limiting.

**Security & Observability:**
- **Telemetry:** OpenTelemetry (`@opentelemetry/sdk-node`) for distributed tracing and structured logging.
- **Validation:** Zod for strict type/contract enforcement across API boundaries.
- **Auth:** JWT / bcrypt for application auth, combined with HMAC-SHA256 verification for external webhooks.
