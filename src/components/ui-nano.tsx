"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Command, Menu, X, Github, Twitter, Linkedin } from "lucide-react";
import { useState, useEffect } from "react";

/**
 * Typography System
 */
export const Eyebrow = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <span className={`text-[12px] font-mono font-semibold tracking-[0.08em] uppercase ${className}`}>
        {children}
    </span>
);

export const H2 = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <h2 className={`text-[28px] md:text-[44px] font-display font-semibold tracking-tight leading-[1.1] ${className}`}>
        {children}
    </h2>
);

export const BodyLarge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <p className={`text-[16px] md:text-[18px] font-sans font-normal leading-[1.5] ${className}`}>
        {children}
    </p>
);

/**
 * Buttons
 */
export const Button = ({ children, variant = "primary", className = "", ...props }: any) => {
    const baseClass = "relative inline-flex items-center justify-center px-4 py-2 text-[14px] font-sans font-medium rounded-[12px] transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-accent/20";
    const variants: Record<string, string> = {
        primary: "bg-accent text-base font-semibold hover:brightness-110 active:scale-[0.98]",
        secondary: "bg-transparent border border-border-subtle text-primary hover:border-accent/30 hover:bg-accent/5 active:scale-[0.98]",
        ghost: "bg-transparent text-secondary hover:text-accent hover:bg-accent/5",
        destructive: "bg-transparent border border-error/20 text-error hover:bg-error/10 active:scale-[0.98]"
    };

    return (
        <button className={`${baseClass} ${variants[variant as keyof typeof variants] ?? variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
};

/**
 * Inputs
 */
export const Input = ({ className = "", ...props }: any) => (
    <input 
        className={`w-full bg-overlay border border-border-subtle rounded-[8px] px-3 py-2 text-[14px] text-primary placeholder-tertiary focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft transition-all duration-150 ease-out ${className}`} 
        {...props} 
    />
);

/**
 * Cards / Panels
 */
export const Card = ({ children, className = "", noPadding = false }: any) => (
    <div
        className={`card-lens bg-raised border border-border-subtle rounded-[16px] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5 ${noPadding ? '' : 'p-6 md:p-8'} ${className}`}
        onMouseMove={(e: React.MouseEvent<HTMLDivElement>) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            e.currentTarget.style.setProperty("--card-mouse-x", `${x}%`);
            e.currentTarget.style.setProperty("--card-mouse-y", `${y}%`);
        }}
    >
        {children}
    </div>
);

// Alias NanoCard to Card for backwards compatibility during transition
export const NanoCard = Card;

/**
 * Badges
 */
export const Badge = ({ children, variant = "neutral", className = "" }: any) => {
    const variants: Record<string, string> = {
        neutral: "bg-overlay text-secondary border border-border-subtle",
        accent: "bg-accent/10 text-accent border border-accent/25",
        success: "bg-success/10 text-success border border-success/20",
        aqua: "bg-accent/10 text-accent border border-accent/20",
    };
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-[8px] text-[12px] font-sans font-medium ${variants[variant as keyof typeof variants] ?? variants.neutral} ${className}`}>
            {children}
        </span>
    );
};

/**
 * Layout Components
 */
export const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-[100] transition-all duration-300 ease-out ${isScrolled ? "h-16 bg-base/85 backdrop-blur-xl border-b border-accent/8" : "h-20 bg-transparent"}`}>
            <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-accent/10 text-accent border border-accent/20 rounded-[8px] flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <Command size={16} />
                    </div>
                    <span className="text-[14px] font-display font-bold tracking-tight text-primary">OmniChat</span>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    {["Features", "Pricing", "Docs"].map(item => (
                        <Link 
                            key={item} 
                            href={item === "Docs" ? "/docs" : `#${item.toLowerCase()}`} 
                            className="text-[14px] font-sans text-secondary hover:text-accent transition-colors"
                        >
                            {item}
                        </Link>
                    ))}
                    <div className="h-4 w-[1px] bg-border-subtle" />
                    <Link href="/login" className="text-[14px] font-sans text-secondary hover:text-primary transition-colors">Log in</Link>
                    <Link href="/register">
                        <Button variant="primary" className="py-1.5 text-[13px]" style={{ boxShadow: '0 0 16px rgba(0,212,216,0.25)' }}>Get started</Button>
                    </Link>
                </div>

                {/* Mobile Toggle */}
                <button 
                    className="md:hidden text-secondary p-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-0 w-full bg-base border-b border-border-subtle p-6 flex flex-col gap-6 md:hidden shadow-xl"
                >
                    {["Features", "Pricing", "Docs"].map(item => (
                        <Link 
                            key={item} 
                            href={`#${item.toLowerCase()}`} 
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-[16px] font-sans text-secondary hover:text-primary"
                        >
                            {item}
                        </Link>
                    ))}
                    <hr className="border-border-subtle" />
                    <Link href="/login" className="text-[16px] font-sans text-primary">Log in</Link>
                    <Link href="/register">
                        <Button variant="primary" className="w-full">Get started</Button>
                    </Link>
                </motion.div>
            )}
        </nav>
    );
};

export const Section = ({ children, id, className, title, subtitle, intro }: any) => (
    <section id={id} className={`py-24 md:py-32 px-6 relative ${className}`}>
        <div className="max-w-[1200px] mx-auto">
            {(title || subtitle) && (
                <div className="mb-16 md:mb-24 flex flex-col items-center text-center max-w-2xl mx-auto">
                    {subtitle && <Eyebrow className="text-secondary mb-4">{subtitle}</Eyebrow>}
                    {title && <H2 className="text-primary">{title}</H2>}
                    {intro && <BodyLarge className="text-secondary mt-6">{intro}</BodyLarge>}
                </div>
            )}
            {children}
        </div>
    </section>
);

export const Footer = () => (
    <footer className="bg-base border-t border-border-subtle py-16 px-6">
        <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-accent/10 text-accent border border-accent/20 rounded-[8px] flex items-center justify-center">
                        <Command size={16} />
                    </div>
                    <span className="text-[14px] font-display font-bold tracking-tight text-primary">OmniChat</span>
                </div>
                <p className="text-secondary text-[14px] max-w-sm leading-relaxed">
                    The cognitive commerce operating system. Autonomously bridging the gap between intention and transaction.
                </p>
            </div>
            <div>
                <h4 className="text-[13px] font-mono font-semibold uppercase tracking-[0.05em] text-primary mb-6">Product</h4>
                <div className="flex flex-col gap-3">
                    {["Features", "Docs", "Pricing", "Status"].map(item => (
                        <Link key={item} href="#" className="text-[14px] text-secondary hover:text-primary transition-colors">{item}</Link>
                    ))}
                </div>
            </div>
            <div>
                <h4 className="text-[13px] font-mono font-semibold uppercase tracking-[0.05em] text-primary mb-6">Company</h4>
                <div className="flex flex-col gap-3">
                    {["Twitter", "Discord", "GitHub", "Contact"].map(item => (
                        <Link key={item} href="#" className="text-[14px] text-secondary hover:text-primary transition-colors">{item}</Link>
                    ))}
                </div>
            </div>
        </div>
        <div className="max-w-[1200px] mx-auto pt-8 border-t border-border-subtle flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[13px] font-sans text-tertiary">© 2026 OmniChat Systems Intelligence</p>
            <div className="flex gap-6">
                <Twitter size={16} className="text-tertiary hover:text-primary transition-colors cursor-pointer" />
                <Github size={16} className="text-tertiary hover:text-primary transition-colors cursor-pointer" />
                <Linkedin size={16} className="text-tertiary hover:text-primary transition-colors cursor-pointer" />
            </div>
        </div>
    </footer>
);
