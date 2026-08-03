"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, AlertCircle, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const strength = (pw: string) => {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
};

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const pw_strength = strength(password);

    const handleRegister = async () => {
        if (!name || !email || !password) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Registration failed");
            }
        } catch {
            setError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const strengthColors = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-accent"];
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

    return (
        <div className="min-h-screen bg-base text-primary flex overflow-hidden">
            {/* ── Left: decorative panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden bg-raised">
                {/* Aqua ambient blobs */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-accent/8 blur-[120px] pointer-events-none" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full bg-accent/05 blur-[80px] pointer-events-none" />

                {/* Animated grid lines */}
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: "linear-gradient(rgba(0,212,216,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,216,1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px"
                }} />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight text-primary">OmniChat</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <h2 className="text-4xl font-bold tracking-tight leading-tight text-primary">
                        Start for free.<br />
                        <span className="text-aqua-gradient">Scale as you grow.</span>
                    </h2>
                    <p className="text-secondary text-[15px] leading-relaxed max-w-sm">
                        Join thousands of merchants using OmniChat to automate conversations and drive more conversions.
                    </p>

                    {/* Feature bullets */}
                    <div className="space-y-3 pt-2">
                        {[
                            "No credit card required",
                            "Deploy in under 5 minutes",
                            "500 conversations free per month",
                            "Cancel anytime",
                        ].map(f => (
                            <div key={f} className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                                <span className="text-[14px] text-secondary">{f}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-tertiary">
                    <ShieldCheck size={14} className="text-accent/50" />
                    <span className="text-[12px] font-mono">256-bit encrypted connection</span>
                </div>
            </div>

            {/* ── Right: borderless form ── */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 relative">
                {/* Mobile logo */}
                <div className="lg:hidden mb-12 self-start">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight">OmniChat</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[400px]"
                >
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Create account.</h1>
                        <p className="text-secondary text-[15px]">Start your free OmniChat workspace today</p>
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 px-4 py-3 bg-error/8 border border-error/15 rounded-xl text-error text-[13px] mb-6"
                            >
                                <AlertCircle size={15} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-8">
                        <div>
                            <label className="text-[11px] font-mono text-accent uppercase tracking-widest mb-3 block">Full Name</label>
                            <input
                                placeholder="Jane Doe"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="input-underline"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-mono text-accent uppercase tracking-widest mb-3 block">Email</label>
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-underline"
                            />
                        </div>

                        <div>
                            <label className="text-[11px] font-mono text-accent uppercase tracking-widest mb-3 block">Password</label>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="Min. 8 characters"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleRegister()}
                                    className="input-underline pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-0 bottom-3 text-tertiary hover:text-secondary transition-colors"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>

                            {/* Password strength meter */}
                            {password.length > 0 && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-1.5">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div
                                                key={i}
                                                className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= pw_strength ? strengthColors[pw_strength] : "bg-border-subtle"}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-[11px] text-tertiary">{strengthLabels[pw_strength]}</span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <motion.button
                        onClick={handleRegister}
                        disabled={loading || !email || !password || !name}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-10 py-4 rounded-xl bg-accent text-base font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        style={{ boxShadow: "0 0 32px rgba(0,212,216,0.25)" }}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
                                Creating account...
                            </span>
                        ) : (
                            <><span>Create account</span><ArrowRight size={18} /></>
                        )}
                    </motion.button>

                    <p className="text-[11px] text-tertiary text-center mt-4 leading-relaxed">
                        By creating an account you agree to our{" "}
                        <a href="#" className="text-accent/70 hover:text-accent transition-colors">Terms</a>
                        {" "}and{" "}
                        <a href="#" className="text-accent/70 hover:text-accent transition-colors">Privacy Policy</a>
                    </p>

                    <p className="text-center text-[13px] text-tertiary mt-8">
                        Already have an account?{" "}
                        <Link href="/login" className="text-accent hover:text-accent-dark transition-colors font-medium">
                            Sign in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
