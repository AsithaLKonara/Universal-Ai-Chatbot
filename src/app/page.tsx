"use client";
import { useEffect, useRef } from "react";
import Lenis from "lenis";
import { Navbar, Section, NanoCard } from "@/components/ui-nano";
import { ChatWidget } from "@/components/chat-widget";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Terminal, Command, Zap, Box, Layers, Globe } from "lucide-react";
import Link from "next/link";
import { useVideoScrub } from "@/hooks/useVideoScrub";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { isLoaded } = useVideoScrub(videoRef);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Lenis Smooth Scrolling Setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  return (
    <div ref={containerRef} className="bg-black selection:bg-accent selection:text-white relative">
      <Navbar />

      {/* Fixed Background Video */}
      <div className="fixed inset-0 w-full h-full z-0 overflow-hidden bg-black">
        <video
          ref={videoRef}
          src="/0513.mp4"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
          muted
          playsInline
          preload="auto"
          // We don't loop or autoplay; the scroll hook controls playback
        />
        {/* Cinematic Dark Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 mix-blend-multiply" />
      </div>

      {/* 
        Scrollable Content Container 
        We set a very large height to provide a long scroll timeline for the video.
      */}
      <div className="relative z-10 w-full" style={{ height: "600vh" }}>
        
        {/* SECTION 1: HERO (0vh to 100vh) */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6">
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0, 0.1], [1, 0]), scale: useTransform(scrollYProgress, [0, 0.1], [1, 0.9]) }}
            className="text-center max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.25em] text-white/60 mb-10 backdrop-blur-md"
            >
              OmniChat Runtime v5.0
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="text-6xl md:text-[140px] font-black tracking-tighter leading-[0.85] mb-10 text-white"
            >
              Cognitive <br /> <span className="opacity-40">Commerce.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="text-lg md:text-2xl font-bold max-w-2xl mx-auto opacity-60 mb-14 leading-tight uppercase tracking-widest text-white/80"
            >
              Scroll to explore the world's first fully autonomous AI operating system for modern retail.
            </motion.p>
          </motion.div>
        </div>

        {/* SECTION 2: AWARENESS (100vh to 200vh) */}
        <div className="h-[100vh] flex items-center sticky top-0 px-6 max-w-7xl mx-auto w-full">
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0.1, 0.2, 0.25, 0.3], [0, 1, 1, 0]), x: useTransform(scrollYProgress, [0.1, 0.2], [100, 0]) }}
            className="max-w-2xl"
          >
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tightest leading-none text-white mb-8">
              Total <br/> <span className="text-accent">Awareness.</span>
            </h2>
            <p className="text-xl font-medium text-white/50 leading-relaxed">
              The AI doesn't just respond. It watches. It learns. It anticipates. 
              Tracking dwell time, hesitation, and comparison paralysis to intervene exactly when needed.
            </p>
          </motion.div>
        </div>

        {/* SECTION 3: FEATURES (200vh to 300vh) */}
        <div className="h-[100vh] flex items-center justify-end sticky top-0 px-6 max-w-7xl mx-auto w-full">
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0.3, 0.4, 0.45, 0.5], [0, 1, 1, 0]), x: useTransform(scrollYProgress, [0.3, 0.4], [-100, 0]) }}
            className="w-full md:w-1/2"
          >
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, title: "Event-Driven", desc: "Reacts to behavioral triggers instantly." },
                { icon: Layers, title: "Multi-Agent", desc: "Specialized cognitive routing." },
                { icon: Box, title: "Semantic Graph", desc: "Understands your catalog deeply." },
                { icon: Globe, title: "Live Sync", desc: "SSE transport for autonomous injection." }
              ].map((f, i) => (
                <div key={i} className="p-8 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl">
                  <f.icon className="text-accent mb-6" size={32} />
                  <h3 className="text-white font-black tracking-widest uppercase text-sm mb-2">{f.title}</h3>
                  <p className="text-white/40 text-xs font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* SECTION 4: SHOWCASE (300vh to 400vh) */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6 w-full">
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0.5, 0.6, 0.65, 0.7], [0, 1, 1, 0]), scale: useTransform(scrollYProgress, [0.5, 0.6], [0.8, 1]) }}
            className="text-center"
          >
            <h2 className="text-6xl md:text-[100px] font-black uppercase tracking-tighter leading-none text-white mb-6">
              The <span className="italic text-white/30">Future</span> of <br/> Conversion.
            </h2>
            <div className="w-[1px] h-32 bg-gradient-to-b from-accent to-transparent mx-auto mt-10" />
          </motion.div>
        </div>

        {/* SECTION 5: CTA (400vh to 500vh) */}
        <div className="h-[100vh] flex items-center justify-center sticky top-0 px-6 w-full bg-gradient-to-t from-black via-black/50 to-transparent">
          <motion.div 
            style={{ opacity: useTransform(scrollYProgress, [0.75, 0.85], [0, 1]), y: useTransform(scrollYProgress, [0.75, 0.85], [100, 0]) }}
            className="text-center max-w-3xl"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-6">Execution Thresholds</p>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tightest mb-16 text-white">Scale with Intelligence.</h2>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center">
              <Link href="/register" className="px-12 py-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 hover:scale-105 transition-transform">
                Initialize System <ArrowRight size={18} />
              </Link>
              <Link href="#protocol" className="px-12 py-6 border border-white/20 text-white font-black text-xs uppercase tracking-widest rounded-full flex items-center justify-center gap-3 transition-all hover:bg-white/10 backdrop-blur-md">
                View Documentation <Terminal size={18} />
              </Link>
            </div>
          </motion.div>
        </div>

      </div>

      <ChatWidget primaryColor="#ffffff" />
    </div>
  );
}
