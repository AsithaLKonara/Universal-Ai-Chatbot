"use client";
import Link from "next/link";
import { motion } from "framer-motion";

export const Navbar = () => (
    <nav className="fixed top-0 w-full z-50 nano-glass h-16">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
            <Link href="/" className="text-sm font-black tracking-tighter uppercase">OmniChat</Link>
            <div className="flex items-center gap-8">
                {["Features", "Docs", "Pricing"].map(item => (
                    <Link key={item} href={`#${item.toLowerCase()}`} className="text-xs font-bold opacity-60 hover:opacity-100 transition-opacity uppercase tracking-widest">{item}</Link>
                ))}
                <Link href="/login" className="px-4 py-2 bg-foreground text-background text-xs font-black rounded-full uppercase tracking-tighter transition-transform active:scale-95">Start</Link>
            </div>
        </div>
    </nav>
);

export const Section = ({ children, id, className }: any) => (
    <section id={id} className={`py-40 px-6 relative overflow-hidden ${className}`}>
        <div className="max-w-7xl mx-auto relative z-10">{children}</div>
    </section>
);

export const NanoCard = ({ children, className }: any) => (
    <div className={`p-8 rounded-3xl nano-glass ${className}`}>
        {children}
    </div>
);
