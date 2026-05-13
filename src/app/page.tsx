"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { Navbar, Section, NanoCard, Footer } from "@/components/ui-nano";
import { ChatWidget } from "@/components/chat-widget";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, Terminal, Zap, Box, Layers, Globe, Shield, Cpu, MessageSquare, ShoppingCart, BarChart3, Check } from "lucide-react";
import Link from "next/link";
import { useCanvasSequence } from "@/hooks/useCanvasSequence";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useCanvasSequence(canvasRef, {
    frameCount: 403,
    getFrameUrl: (i) => `/frames/frame_${i.toString().padStart(4, "0")}.jpg`,
    lerpScroll: 0.05,
    lerpFrame: 0.12,
  });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

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
    <div ref={containerRef} className="bg-black selection:bg-accent selection:text-white relative">
      <Navbar />

      {/* Fixed Background Video — GPU accelerated */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      </div>

      <div className="relative z-10 w-full">

        {/* ── CHAPTER 1: HERO ── */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6 overflow-hidden">
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.12], [1, 0]),
              scale: useTransform(scrollYProgress, [0, 0.12], [1, 0.88]),
              y: useTransform(scrollYProgress, [0, 0.12], [0, -40]),
            }}
            className="text-center max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-white/60 mb-10 backdrop-blur-md"
            >
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent" />
              </span>
              OmniChat Runtime v5.0
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-6xl md:text-[130px] font-black tracking-tighter leading-[0.85] mb-10 text-white"
            >
              Cognitive <br /> <span className="opacity-30 italic">Commerce.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="text-lg md:text-xl font-semibold max-w-xl mx-auto opacity-50 mb-14 leading-relaxed uppercase tracking-widest text-white"
            >
              The world&apos;s first fully autonomous AI operating system for modern retail and high-end storefronts.
            </motion.p>
          </motion.div>
        </div>

        {/* ── CHAPTER 2: AWARENESS ── */}
        <div className="h-[100vh] flex items-center sticky top-0 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              style={{
                opacity: useTransform(scrollYProgress, [0.12, 0.18, 0.3, 0.38], [0, 1, 1, 0]),
                x: useTransform(scrollYProgress, [0.12, 0.22], [80, 0]),
              }}
              className="max-w-2xl"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Intelligence Layer</p>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white mb-8">
                Total <br /> <span className="text-accent">Awareness.</span>
              </h2>
              <p className="text-lg font-medium text-white/50 leading-relaxed max-w-lg">
                The AI doesn&apos;t just respond. It watches. It learns. It anticipates.
                Tracking dwell time, hesitation, and comparison paralysis to intervene exactly when needed.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── CHAPTER 3: FEATURES GRID ── */}
        <Section 
            id="features"
            subtitle="The Architecture"
            title="Neural Capabilities"
            className="bg-black/80 backdrop-blur-3xl z-20"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { icon: Cpu, title: "Cognitive Routing", desc: "Autonomous multi-agent system that routes intent to specialized sales, support, or fulfillment agents." },
                    { icon: MessageSquare, title: "Omni-Channel Sync", desc: "Seamless message persistence across WhatsApp, Web, and Social interfaces with zero context loss." },
                    { icon: ShoppingCart, title: "Checkout-as-Code", desc: "Deterministic state machines handle complex transactions, shipping, and payments directly in-chat." },
                    { icon: BarChart3, title: "Predictive Analytics", desc: "Analyze customer hesitation patterns and sentiment in real-time to optimize conversion windows." },
                    { icon: Shield, title: "Enterprise RBAC", desc: "Fine-grained access control for teams, ensuring strict data isolation across project nodes." },
                    { icon: Globe, title: "Global Sync", desc: "Real-time product catalog synchronization with WooCommerce, Shopify, and custom backends." }
                ].map((item, i) => (
                    <NanoCard key={i} glow={i === 0}>
                        <item.icon className="text-accent mb-8" size={32} />
                        <h3 className="text-white font-black uppercase tracking-[0.2em] text-sm mb-4">{item.title}</h3>
                        <p className="text-white/40 text-xs font-medium leading-relaxed">{item.desc}</p>
                    </NanoCard>
                ))}
            </div>
        </Section>

        {/* ── CHAPTER 4: PRICING ── */}
        <Section 
            id="pricing"
            subtitle="Scalability"
            title="Select Plan"
            className="bg-transparent z-20"
        >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: "Starter", price: "Free", desc: "For exploring the ecosystem", features: ["1 Project Node", "500 Messages / mo", "Basic Intent Recognition", "Community Support"] },
                    { name: "Pro", price: "$49", desc: "For growing commerce brands", features: ["5 Project Nodes", "Unlimited Messages", "WhatsApp Integration", "WooCommerce Sync", "Priority Support"], popular: true },
                    { name: "Enterprise", price: "Custom", desc: "For global scale operations", features: ["Unlimited Nodes", "Dedicated Compute", "SLA Guarantee", "White-label Support", "24/7 Concierge"] }
                ].map((plan, i) => (
                    <NanoCard key={i} className={`relative overflow-hidden ${plan.popular ? "border-accent/40" : ""}`}>
                        {plan.popular && (
                            <div className="absolute top-0 right-0 bg-accent text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-xl">Popular</div>
                        )}
                        <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{plan.name}</h3>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-4xl font-black text-white">{plan.price}</span>
                            {plan.price !== "Free" && plan.price !== "Custom" && <span className="text-white/20 text-xs">/ mo</span>}
                        </div>
                        <p className="text-white/40 text-xs mb-8">{plan.desc}</p>
                        <div className="space-y-4 mb-10">
                            {plan.features.map(f => (
                                <div key={f} className="flex items-center gap-3">
                                    <Check size={14} className="text-accent" />
                                    <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{f}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/register" className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center transition-all ${plan.popular ? "bg-accent text-white hover:scale-105" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"}`}>
                            Initialize Node
                        </Link>
                    </NanoCard>
                ))}
            </div>
        </Section>

        {/* ── CHAPTER 5: FAQ ── */}
        <Section 
            id="faq"
            subtitle="Knowledge Base"
            title="Common Inquiries"
            className="bg-black z-20"
        >
            <div className="max-w-3xl mx-auto space-y-4">
                {[
                    { q: "How is data isolation handled?", a: "Every project is assigned a unique logical partition with separate encryption keys, ensuring multi-tenant security at the core." },
                    { q: "Can I integrate custom ERPs?", a: "Yes. Our open Protocol API allows you to bridge any backend system to the OmniChat cognitive runtime via secure webhooks." },
                    { q: "What is 'Checkout-as-Code'?", a: "It's our proprietary state-machine framework that converts chat intent directly into programmatic checkout objects, bypassing standard cart friction." }
                ].map((faq, i) => (
                    <NanoCard key={i} className="p-6">
                        <h3 className="text-white font-black uppercase tracking-[0.1em] text-xs mb-3">{faq.q}</h3>
                        <p className="text-white/40 text-xs leading-relaxed">{faq.a}</p>
                    </NanoCard>
                ))}
            </div>
        </Section>

        {/* ── CHAPTER 6: FINAL CTA ── */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6 overflow-hidden z-10">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0.8, 0.95], [0, 1]),
              y: useTransform(scrollYProgress, [0.8, 0.95], [60, 0]),
            }}
            className="text-center max-w-3xl relative z-10"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Neural Activation</p>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-16 text-white leading-none">
              Deploy Your First Node.
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95"
              >
                Initialize System <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* ── FOOTER ── */}
        <div className="relative z-20 bg-black">
            <Footer />
        </div>

      </div>

      <ChatWidget primaryColor="#ffffff" />
    </div>
  );
}
