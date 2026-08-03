"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Mail, CheckCircle2, MailCheck } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) return;
        setLoading(true);
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1200);
    };

    return (
        <div className="min-h-screen bg-base text-primary flex items-center justify-center p-8 relative overflow-hidden">
            {/* Ambient aqua glows */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: "30%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 600, height: 600,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,212,216,0.08) 0%, transparent 70%)",
                }}
            />
            <div
                className="absolute pointer-events-none"
                style={{
                    bottom: "10%", right: "15%",
                    width: 300, height: 300,
                    borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,212,216,0.05) 0%, transparent 70%)",
                }}
            />

            {/* Top-left logo */}
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                        </svg>
                    </div>
                    <span className="text-[15px] font-semibold tracking-tight text-primary hidden sm:block">OmniChat</span>
                </Link>
            </div>

            <div className="w-full max-w-[420px] relative z-10">
                <AnimatePresence mode="wait">
                    {!sent ? (
                        <motion.div
                            key="form"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -24 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8">
                                <Mail size={24} className="text-accent" />
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-primary mb-3">Reset password.</h1>
                            <p className="text-secondary text-[15px] mb-10 leading-relaxed">
                                Enter your email and we&apos;ll send a link to reset your password.
                            </p>

                            <div className="mb-8">
                                <label className="text-[11px] font-mono text-accent uppercase tracking-widest mb-3 block">
                                    Email address
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@company.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleReset()}
                                    className="input-underline"
                                    autoFocus
                                />
                            </div>

                            <motion.button
                                onClick={handleReset}
                                disabled={loading || !email}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 rounded-xl bg-accent text-base font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ boxShadow: "0 0 32px rgba(0,212,216,0.25)" }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    <><span>Send reset link</span><ArrowRight size={18} /></>
                                )}
                            </motion.button>

                            <Link
                                href="/login"
                                className="flex items-center gap-2 justify-center mt-8 text-[13px] text-tertiary hover:text-accent transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to sign in
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                            className="text-center"
                        >
                            {/* Animated success icon */}
                            <div className="relative mx-auto mb-8 w-20 h-20">
                                <div className="absolute inset-0 rounded-full bg-accent/10 animate-ping opacity-40" />
                                <div className="relative w-20 h-20 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                                    <MailCheck size={32} className="text-accent" />
                                </div>
                            </div>

                            <h2 className="text-3xl font-bold tracking-tight text-primary mb-3">Check your inbox.</h2>
                            <p className="text-secondary text-[15px] leading-relaxed mb-8">
                                We sent a password reset link to{" "}
                                <span className="text-accent font-medium">{email}</span>
                            </p>

                            {/* Tips */}
                            <div className="bg-raised border border-border-subtle rounded-xl p-4 text-left mb-8 space-y-2">
                                {["Check your spam folder", "Link expires in 24 hours", "Only click links from OmniChat"].map(tip => (
                                    <div key={tip} className="flex items-center gap-2 text-[13px] text-tertiary">
                                        <CheckCircle2 size={14} className="text-accent/50 flex-shrink-0" />
                                        {tip}
                                    </div>
                                ))}
                            </div>

                            <Link
                                href="/login"
                                className="flex items-center gap-2 justify-center text-[13px] text-tertiary hover:text-accent transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to sign in
                            </Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
