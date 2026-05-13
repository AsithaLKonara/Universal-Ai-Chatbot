"use client";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Command, Menu, X, Github, Twitter, Linkedin, Mail } from "lucide-react";
import { useState, useEffect } from "react";

export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav 
            className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
                isScrolled ? "h-16 bg-black/60 backdrop-blur-xl border-b border-white/10" : "h-24 bg-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center transition-transform group-hover:rotate-12">
                        <Command size={18} />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase text-white">OmniChat</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-10">
                    {["Features", "Pricing", "Docs", "About"].map(item => (
                        <Link 
                            key={item} 
                            href={item === "Docs" ? "/docs" : `#${item.toLowerCase()}`} 
                            className="text-[10px] font-black opacity-40 hover:opacity-100 transition-all uppercase tracking-[0.2em] text-white hover:text-accent"
                        >
                            {item}
                        </Link>
                    ))}
                    <div className="h-4 w-[1px] bg-white/10" />
                    <Link href="/login" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors">Login</Link>
                    <Link href="/register" className="px-6 py-2.5 bg-white text-black text-[10px] font-black rounded-full uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl">
                        Initialize
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden text-white p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 w-full bg-black/95 backdrop-blur-3xl border-b border-white/10 p-8 flex flex-col gap-6 md:hidden"
                >
                    {["Features", "Pricing", "Docs", "About"].map(item => (
                        <Link 
                            key={item} 
                            href={`#${item.toLowerCase()}`} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-lg font-black uppercase tracking-widest text-white/60 hover:text-white"
                        >
                            {item}
                        </Link>
                    ))}
                    <hr className="border-white/10" />
                    <Link href="/login" className="text-lg font-black uppercase tracking-widest text-white">Login</Link>
                    <Link href="/register" className="w-full py-4 bg-white text-black text-center font-black rounded-2xl uppercase tracking-widest">Register</Link>
                </motion.div>
            )}
        </nav>
    );
};

export const Section = ({ children, id, className, title, subtitle }: any) => (
    <section id={id} className={`py-32 px-6 relative ${className}`}>
        <div className="max-w-7xl mx-auto">
            {(title || subtitle) && (
                <div className="mb-20 text-center md:text-left">
                    {subtitle && <p className="text-[10px] font-black uppercase tracking-[0.5em] text-accent mb-4">{subtitle}</p>}
                    {title && <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tightest leading-none text-white">{title}</h2>}
                </div>
            )}
            {children}
        </div>
    </section>
);

export const NanoCard = ({ children, className, glow = false }: any) => (
    <div className={`p-8 rounded-[32px] bg-white/[0.03] border border-white/10 backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/20 group ${glow ? "shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)]" : ""} ${className}`}>
        {children}
    </div>
);

export const Footer = () => (
    <footer className="bg-black border-t border-white/5 py-20 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-20">
            <div className="col-span-2">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center">
                        <Command size={18} />
                    </div>
                    <span className="text-sm font-black tracking-tighter uppercase text-white">OmniChat</span>
                </div>
                <p className="text-white/40 text-sm font-medium max-w-sm leading-relaxed">
                    The cognitive commerce operating system. Autonomously bridging the gap between intention and transaction.
                </p>
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Protocol</h4>
                <div className="flex flex-col gap-4">
                    {["Features", "Docs", "Pricing", "Status"].map(item => (
                        <Link key={item} href="#" className="text-xs font-bold text-white/40 hover:text-white transition-colors">{item}</Link>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">Neural</h4>
                <div className="flex flex-col gap-4">
                    {["Twitter", "Discord", "GitHub", "Contact"].map(item => (
                        <Link key={item} href="#" className="text-xs font-bold text-white/40 hover:text-white transition-colors">{item}</Link>
                    ))}
                </div>
            </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/20">© 2026 OmniChat Systems Intelligence</p>
            <div className="flex gap-6">
                <Twitter size={16} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
                <Github size={16} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
                <Linkedin size={16} className="text-white/20 hover:text-white transition-colors cursor-pointer" />
            </div>
        </div>
    </footer>
);
