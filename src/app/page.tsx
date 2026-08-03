"use client";
import { useEffect, useState } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { Navbar, Section, Card, Footer, Button, Eyebrow, H2, BodyLarge, Badge } from "@/components/ui-nano";
import { ChatDemo } from "@/components/chat-demo";
import { ChatWidget } from "@/components/chat-widget";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Zap, Box, Layers, Globe, Shield, Cpu, MessageSquare, ShoppingCart, BarChart3, Check, ChevronDown } from "lucide-react";
import Link from "next/link";

const AccordionItem = ({ q, a }: { q: string; a: string }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div
            className={`cursor-pointer bg-raised border rounded-[16px] transition-all duration-200 hover:border-accent/30 ${isOpen ? 'border-accent/30 shadow-[0_0_20px_-8px_rgba(0,212,216,0.2)]' : 'border-border-subtle'}`}
            onClick={() => setIsOpen(!isOpen)}
        >
            <div className="p-6 md:p-7">
                <div className="flex justify-between items-center">
                    <h3 className="text-[16px] md:text-[17px] font-sans font-medium text-primary pr-4">{q}</h3>
                    <ChevronDown size={18} className={`text-accent transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
                <AnimatePresence>
                    {isOpen && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                            className="overflow-hidden"
                        >
                            <p className="pt-4 text-secondary text-[15px] leading-relaxed">{a}</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default function Home() {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-base selection:bg-accent-soft selection:text-accent relative font-sans">
      <Navbar />

      {/* ── 1. HERO & CHAT DEMO ── */}
      <div className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-12 overflow-hidden">
        {/* Hero Video Background */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-base">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            style={{ filter: 'saturate(0.4) hue-rotate(150deg)' }}
          >
            <source src="/0513.mp4" type="video/mp4" />
          </video>
          {/* Aqua tint overlay */}
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,212,216,0.04) 0%, rgba(12,12,15,0.7) 40%, rgba(12,12,15,0.95) 100%)' }} />
        </div>

        <div className="relative z-10 w-full max-w-[1200px] flex flex-col items-center mt-10 md:mt-0">
          <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Badge variant="accent" className="mb-8">OmniChat Runtime v5.0</Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl md:text-[88px] font-display font-bold tracking-tight leading-[1.05] text-primary mb-8"
            >
              The cognitive <span className="text-aqua-gradient"><br className="hidden md:block"/>commerce layer.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-[18px] md:text-[22px] font-sans text-secondary max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              An autonomous AI operating system that bridges the gap between intention and transaction.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button variant="primary" className="py-3 px-8 rounded-full font-bold" style={{ boxShadow: '0 0 32px rgba(0,212,216,0.3)' }}>Start Building</Button>
              </Link>
              <Link href="/docs">
                <Button variant="secondary" className="py-3 px-8 rounded-full font-semibold">Read the Docs</Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

            {/* ── 2. SOCIAL PROOF ── */}
            <div className="py-12 border-b border-accent/8 bg-base">
                <div className="max-w-[1200px] mx-auto px-6 flex flex-col items-center">
                    <p className="text-[11px] font-mono text-tertiary mb-8 uppercase tracking-widest text-center">Engineered to integrate with</p>
                    <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 hover:opacity-100 transition-all duration-700">
                        {["WooCommerce", "Shopify", "Stripe", "WhatsApp", "Postmark"].map(brand => (
                            <span key={brand} className="text-xl font-bold font-display text-accent hover:text-primary transition-colors duration-300">{brand}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── 3. NEURAL CAPABILITIES (BENTO GRID) ── */}
            <Section 
                id="features"
                subtitle="Capabilities"
                title="Engineered for scale."
                intro="Everything you need to automate a modern storefront, built on a deterministic state machine."
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Large Bento Item 1 with static chat demo */}
                    <Card className="md:col-span-2 relative overflow-hidden flex flex-col justify-between group">
                        <div className="mb-8">
                            <Badge variant="neutral" className="mb-4">Routing</Badge>
                            <h3 className="text-2xl font-display font-semibold text-primary mb-3">Cognitive Routing</h3>
                            <p className="text-secondary leading-relaxed max-w-md">Autonomous multi-agent system that seamlessly hands off conversations between sales, support, and fulfillment agents based on user intent.</p>
                        </div>
                        <div className="mt-auto -mb-8 -mx-8 pl-8 pt-8 md:pl-16 md:pt-16 border-t border-l border-border-subtle rounded-tl-[24px] bg-base shadow-2xl translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <ChatDemo isStatic={true} conversation={[
                                { id: "1", role: "user", content: "My shirt arrived torn." },
                                { id: "2", role: "assistant", content: "I'm so sorry about that. Handing you over to Returns." },
                                { id: "3", role: "assistant", content: "Returns Agent: I've generated a prepaid label for you. Would you like a refund or replacement?" },
                            ]} />
                        </div>
                    </Card>

                    {/* Standard Bento Items */}
                    <Card data-reveal className="flex flex-col relative overflow-hidden group">
                        <ShoppingCart className="text-accent mb-6" size={24} />
                        <h3 className="text-[18px] font-display font-semibold text-primary mb-3">Checkout-as-Code</h3>
                        <p className="text-secondary leading-relaxed text-[15px]">Handle complex transactions, variant selections, and payments securely inside the chat interface.</p>
                        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>

                    <Card data-reveal className="flex flex-col relative overflow-hidden group">
                        <Globe className="text-accent mb-6" size={24} />
                        <h3 className="text-[18px] font-display font-semibold text-primary mb-3">Global Sync</h3>
                        <p className="text-secondary leading-relaxed text-[15px]">Real-time product catalog synchronization with your existing e-commerce backends and inventory management systems.</p>
                        <div className="absolute inset-0 bg-gradient-to-t from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </Card>

                    {/* Large Bento Item 2 */}
                    <Card data-reveal className="md:col-span-2 relative overflow-hidden flex flex-col justify-center group">
                        <div className="absolute right-0 bottom-0 opacity-10 blur-xl group-hover:opacity-30 transition-opacity duration-500 w-64 h-64 bg-accent rounded-full translate-x-1/3 translate-y-1/3"></div>
                        <BarChart3 className="text-accent mb-6" size={24} />
                        <h3 className="text-2xl font-display font-semibold text-primary mb-3">Predictive Analytics</h3>
                        <p className="text-secondary leading-relaxed max-w-lg text-[15px]">Analyze customer hesitation patterns and sentiment in real-time to optimize conversion windows and trigger proactive engagement.</p>
                    </Card>
                </div>
            </Section>

            {/* ── 4. HOW IT WORKS ── */}
            <Section 
                id="how-it-works"
                className="bg-raised border-y border-border-subtle"
            >
                <div className="max-w-[1000px] mx-auto">
                    <div className="mb-16">
                        <Eyebrow className="text-secondary mb-4">Integration</Eyebrow>
                        <H2 className="text-primary">Deploy in minutes.</H2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        <div className="hidden md:block absolute top-[24px] left-[15%] right-[15%] h-[1px] bg-border-subtle z-0" />
                        
                        {[
                            { step: "01", title: "Connect Catalog", desc: "Sync your store via our native integrations or API." },
                            { step: "02", title: "Train Models", desc: "Our system automatically indexes your products, policies, and FAQs." },
                            { step: "03", title: "Deploy Widget", desc: "Embed the 14kb script on your site or connect WhatsApp." }
                        ].map((item, i) => (
                            <div key={item.step} data-reveal className="relative z-10 flex flex-col items-start" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/25 flex items-center justify-center text-accent font-mono font-bold text-[14px] mb-6">
                                    {item.step}
                                </div>
                                <h3 className="text-[18px] font-display font-semibold text-primary mb-3">{item.title}</h3>
                                <p className="text-secondary text-[15px] leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ── 5. TOTAL AWARENESS ── */}
            <Section className="py-40">
                <div className="max-w-3xl mx-auto text-center" data-reveal>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-8">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                        <span className="text-[12px] font-mono text-accent uppercase tracking-widest">The Operating System</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-display font-bold text-primary leading-[1.1] tracking-tight mb-8">
                        The AI doesn&apos;t just respond.<br /><span className="text-aqua-gradient">It watches. It learns.</span>
                    </h2>
                    <p className="text-xl text-secondary leading-relaxed">
                        OmniChat tracks dwell time, hesitation, and comparison paralysis to intervene exactly when needed. It turns a static storefront into an active, consultative sales floor.
                    </p>
                </div>
            </Section>

            {/* ── 6. PRICING ── */}
            <Section 
                id="pricing"
                subtitle="Scalability"
                title="Predictable pricing."
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { name: "Starter", price: "Free", desc: "For exploring the ecosystem.", features: ["1 Project Node", "500 Messages / mo", "Basic Intent Recognition", "Community Support"], cta: "Get started", variant: "secondary" },
                        { name: "Pro", price: "$49", desc: "For growing commerce brands.", features: ["5 Project Nodes", "Unlimited Messages", "WhatsApp Integration", "WooCommerce Sync"], cta: "Start Pro Trial", variant: "primary", popular: true },
                        { name: "Enterprise", price: "Custom", desc: "For global scale operations.", features: ["Unlimited Nodes", "Dedicated Compute", "SLA Guarantee", "24/7 Concierge"], cta: "Contact Sales", variant: "secondary" }
                    ].map((plan, i) => (
                        <Card data-reveal key={i} className={`flex flex-col h-full relative ${plan.popular ? 'border-accent/40 shadow-[0_0_60px_-15px_rgba(0,212,216,0.3)]' : 'group hover:border-accent/20'}`}>
                            {plan.popular && (
                                <div className="absolute -top-3 right-6">
                                    <span className="bg-accent text-base text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Recommended</span>
                                </div>
                            )}
                            <h3 className="text-[16px] font-mono font-medium text-primary mb-4">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className={`text-5xl font-display font-bold ${plan.popular ? 'text-aqua-gradient' : 'text-primary'}`}>{plan.price}</span>
                                {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-secondary text-[14px]">/ mo</span>}
                            </div>
                            <p className="text-secondary text-[14px] mb-8">{plan.desc}</p>
                            
                            <div className="space-y-4 mb-10 flex-grow">
                                {plan.features.map(f => (
                                    <div key={f} className="flex items-center gap-3">
                                        <Check size={16} className="text-accent" />
                                        <span className="text-[14px] text-primary">{f}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <Button variant={plan.variant} className="w-full py-2.5" style={plan.popular ? { boxShadow: '0 0 24px rgba(0,212,216,0.25)' } : {}}>
                                {plan.cta}
                            </Button>
                        </Card>
                    ))}
                </div>
            </Section>

            {/* ── 7. FAQ ── */}
            <Section 
                id="faq"
                subtitle="Knowledge Base"
                title="Common inquiries."
            >
                <div className="max-w-3xl mx-auto space-y-4" data-reveal>
                    <AccordionItem 
                        q="How is data isolation handled?" 
                        a="Every project is assigned a unique logical partition with separate encryption keys, ensuring strict multi-tenant security and RBAC enforcement at the database level." 
                    />
                    <AccordionItem 
                        q="Can I integrate custom ERPs?" 
                        a="Yes. Our open Protocol API allows you to bridge any backend system to the OmniChat cognitive runtime via secure webhooks and REST endpoints." 
                    />
                    <AccordionItem 
                        q="What is 'Checkout-as-Code'?" 
                        a="It's our proprietary state-machine framework that converts chat intent directly into programmatic checkout objects, bypassing standard cart friction and enabling one-click purchasing in-thread." 
                    />
                </div>
            </Section>

            {/* ── 8. FINAL CTA ── */}
            <Section className="py-32 border-b border-accent/8 bg-raised">
                <div className="text-center max-w-3xl mx-auto" data-reveal>
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-8">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                        <span className="text-[11px] font-mono text-accent uppercase tracking-widest">Ready when you are</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-primary tracking-tight mb-4">
                        Deploy in <span className="text-aqua-gradient">minutes.</span>
                    </h2>
                    <p className="text-secondary text-[17px] mb-10 leading-relaxed">No credit card. No lock-in. Just smarter commerce.</p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/register">
                            <Button variant="primary" className="px-10 py-3.5 rounded-full font-bold w-full sm:w-auto text-[15px]" style={{ boxShadow: '0 0 40px rgba(0,212,216,0.3)' }}>Get started for free</Button>
                        </Link>
                        <Link href="/contact">
                            <Button variant="secondary" className="px-10 py-3.5 rounded-full font-bold w-full sm:w-auto text-[15px]">Contact Sales</Button>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* ── FOOTER ── */}
            <Footer />
      <ChatWidget primaryColor="#00D4D8" />
    </div>
  );
}
