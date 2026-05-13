"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { Navbar } from "@/components/ui-nano";
import { ChatWidget } from "@/components/chat-widget";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Terminal, Zap, Box, Layers, Globe } from "lucide-react";
import Link from "next/link";
import { useVideoScrub } from "@/hooks/useVideoScrub";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useVideoScrub(videoRef);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // ── Lenis + GSAP co-tick ─────────────────────────────────────────────────
  // Running Lenis inside the GSAP ticker ensures Lenis scroll updates and
  // our video scrub tick happen in the EXACT SAME animation frame — perfect sync.
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 1.8,
    });

    // Key integration: Lenis runs inside GSAP ticker
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add((time) => {
      // GSAP time is in seconds, Lenis.raf() expects milliseconds
      lenis.raf(time * 1000);
    });

    return () => {
      lenis.destroy();
      // Note: gsap.ticker keeps running for the video scrub hook
    };
  }, []);

  return (
    <div ref={containerRef} className="bg-black selection:bg-accent selection:text-white relative">
      <Navbar />

      {/* Fixed Background Video — GPU accelerated */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          src="/0513.mp4"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          muted
          playsInline
          preload="auto"
          // GPU acceleration via inline style
          style={{
            willChange: "transform",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
          }}
        />
        {/* Multi-stop cinematic overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
      </div>

      {/*
        Scrollable content: 600vh gives the video ample runway.
        Each section is sticky + 100vh so it pins during its "chapter".
      */}
      <div className="relative z-10 w-full" style={{ height: "600vh" }}>

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
              Scroll to explore the world&apos;s first fully autonomous AI operating system for modern retail.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-2 text-white/30 text-xs uppercase tracking-widest"
            >
              <span className="w-4 h-[1px] bg-white/30" />
              Scroll to begin
              <span className="w-4 h-[1px] bg-white/30" />
            </motion.div>
          </motion.div>
        </div>

        {/* ── CHAPTER 2: AWARENESS ── */}
        <div className="h-[100vh] flex items-center sticky top-0 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full">
            <motion.div
              style={{
                opacity: useTransform(scrollYProgress, [0.12, 0.22, 0.28, 0.35], [0, 1, 1, 0]),
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

        {/* ── CHAPTER 3: FEATURES ── */}
        <div className="h-[100vh] flex items-center justify-end sticky top-0 px-6 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full flex justify-end">
            <motion.div
              style={{
                opacity: useTransform(scrollYProgress, [0.35, 0.45, 0.5, 0.56], [0, 1, 1, 0]),
                x: useTransform(scrollYProgress, [0.35, 0.45], [-80, 0]),
              }}
              className="w-full md:w-[55%]"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Core Capabilities</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Zap, title: "Event-Driven", desc: "Reacts to behavioral triggers in real time." },
                  { icon: Layers, title: "Multi-Agent", desc: "Specialized cognitive routing engine." },
                  { icon: Box, title: "Semantic Graph", desc: "Deep understanding of your catalog." },
                  { icon: Globe, title: "Live Sync", desc: "SSE for autonomous message injection." }
                ].map((f, i) => (
                  <div key={i} className="p-8 rounded-[28px] bg-white/[0.04] border border-white/10 backdrop-blur-2xl">
                    <f.icon className="text-accent mb-5" size={28} />
                    <h3 className="text-white font-black tracking-widest uppercase text-xs mb-2">{f.title}</h3>
                    <p className="text-white/40 text-xs font-medium leading-relaxed">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── CHAPTER 4: STATEMENT ── */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6 overflow-hidden">
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0.56, 0.65, 0.7, 0.76], [0, 1, 1, 0]),
              scale: useTransform(scrollYProgress, [0.56, 0.65], [0.85, 1]),
            }}
            className="text-center"
          >
            <h2 className="text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-none text-white">
              The <span className="italic text-white/25">Future</span> of <br /> Conversion.
            </h2>
            <div className="w-[1px] h-28 bg-gradient-to-b from-accent/80 to-transparent mx-auto mt-12" />
          </motion.div>
        </div>

        {/* ── CHAPTER 5: CTA ── */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0.8, 0.9], [0, 1]),
              y: useTransform(scrollYProgress, [0.8, 0.9], [60, 0]),
            }}
            className="text-center max-w-3xl relative z-10"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Execution Thresholds</p>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-16 text-white leading-none">
              Scale with Intelligence.
            </h2>
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="px-10 py-5 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-transform active:scale-95"
              >
                Initialize System <ArrowRight size={16} />
              </Link>
              <Link
                href="/docs"
                className="px-10 py-5 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:bg-white/10 transition-all backdrop-blur-md"
              >
                View Documentation <Terminal size={16} />
              </Link>
            </div>
          </motion.div>
        </div>

      </div>

      <ChatWidget primaryColor="#ffffff" />
    </div>
  );
}
