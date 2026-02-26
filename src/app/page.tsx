"use client";
import { Navbar, Section, NanoCard } from "@/components/ui-nano";
import { ChatWidget } from "@/components/chat-widget";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Layers, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="bg-background selection:bg-accent selection:text-white">
      <Navbar />

      <Section className="min-h-screen flex items-center nano-gradient">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="text-7xl md:text-9xl font-black tracking-tightest leading-[0.9] mb-8"
          >
            INTELLIGENCE <br /> <span className="opacity-20 italic">WITHOUT</span> LIMITS.
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl font-medium max-w-2xl opacity-50 mb-12 leading-tight"
          >
            Extreme-fidelity context-aware AI engine. Sub-second latency. Zero conflict.
          </motion.p>
          <motion.div
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            className="flex gap-4"
          >
            <button className="px-10 py-5 bg-foreground text-background font-black text-sm uppercase tracking-tighter rounded-full flex items-center gap-2 group">
              Acquire SDK <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </Section>

      <Section id="features">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Cpu, label: "Core Execution", text: "Proprietary AI orchestration." },
            { icon: Layers, label: "Neural Layering", text: "Isolated Shadow DOM architecture." },
            { icon: ShieldCheck, label: "End-to-End", text: "Full spectrum security protocols." }
          ].map((f, i) => (
            <NanoCard key={i} className="hover:border-accent transition-colors group">
              <f.icon className="mb-8 opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all" size={32} />
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">{f.label}</h3>
              <p className="opacity-50 text-sm font-medium leading-relaxed">{f.text}</p>
            </NanoCard>
          ))}
        </div>
      </Section>

      <Section id="pricing" className="text-center">
        <h2 className="text-5xl font-black uppercase tracking-tighter mb-20 opacity-20">Resource Allocation</h2>
        <div className="grid md:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {[
            { tier: "Free", price: "0" },
            { tier: "Professional", price: "29", active: true },
            { tier: "Corporate", price: "99" }
          ].map((p, i) => (
            <div key={i} className={`p-10 rounded-3xl border-2 transition-all text-left ${p.active ? "border-accent bg-accent/5" : "border-border"}`}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-50">{p.tier}</h4>
              <div className="text-4xl font-black mb-8">${p.price}<span className="text-sm opacity-40">/MO</span></div>
              <button className={`w-full py-4 rounded-full font-black text-xs uppercase tracking-tighter ${p.active ? "bg-accent text-white" : "border border-foreground"}`}>Select Plan</button>
            </div>
          ))}
        </div>
      </Section>

      <footer className="py-20 px-6 border-t border-border text-center opacity-30 text-[10px] font-black uppercase tracking-widest">
        &copy; 2025 OMNICHAT. SYSTEM ONLINE.
      </footer>

      <ChatWidget primaryColor="#3b82f6" />
    </div>
  );
}
