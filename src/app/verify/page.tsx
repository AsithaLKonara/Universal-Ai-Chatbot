"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle2, Mail, Smartphone, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyContent() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);
    const [type, setType] = useState<"email" | "phone">("email");
    const [resendCooldown, setResendCooldown] = useState(0);
    const inputs = useRef<(HTMLInputElement | null)[]>([]);
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const t = searchParams.get("type");
        if (t === "phone") setType("phone");
    }, [searchParams]);

    useEffect(() => {
        if (resendCooldown > 0) {
            const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [resendCooldown]);

    const handleInput = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const v = value.slice(-1);
        const next = [...code];
        next[index] = v;
        setCode(next);
        if (v && index < 5) inputs.current[index + 1]?.focus();
        // Auto-submit when all filled
        if (v && next.every(d => d) && index === 5) {
            setTimeout(() => handleVerify(next), 100);
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
        if (e.key === "ArrowLeft" && index > 0) inputs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < 5) inputs.current[index + 1]?.focus();
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6).split("");
        const next = [...code];
        pasted.forEach((d, i) => { next[i] = d; });
        setCode(next);
        const lastFilled = Math.min(pasted.length - 1, 5);
        inputs.current[lastFilled]?.focus();
        if (pasted.length === 6) setTimeout(() => handleVerify(next), 100);
    };

    const handleVerify = async (c = code) => {
        if (c.some(d => !d)) return;
        setLoading(true);
        setTimeout(() => {
            setVerified(true);
            setLoading(false);
            setTimeout(() => router.push("/dashboard?verified=true"), 1500);
        }, 1500);
    };

    const handleResend = () => {
        setResendCooldown(60);
        setCode(["", "", "", "", "", ""]);
        inputs.current[0]?.focus();
    };

    const allFilled = code.every(d => d);

    return (
        <div className="min-h-screen bg-base text-primary flex items-center justify-center p-8 relative overflow-hidden">
            {/* Ambient glow */}
            <div
                className="absolute pointer-events-none"
                style={{
                    top: "40%", left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: 700, height: 700, borderRadius: "50%",
                    background: "radial-gradient(circle, rgba(0,212,216,0.07) 0%, transparent 65%)",
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

            <div className="w-full max-w-[480px] relative z-10">
                <AnimatePresence mode="wait">
                    {!verified ? (
                        <motion.div
                            key="verify"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        >
                            {/* Icon */}
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-8">
                                {type === "email"
                                    ? <Mail size={24} className="text-accent" />
                                    : <Smartphone size={24} className="text-accent" />
                                }
                            </div>

                            <h1 className="text-3xl font-bold tracking-tight text-primary mb-3">Verify your {type}.</h1>
                            <p className="text-secondary text-[15px] mb-10 leading-relaxed">
                                We sent a 6-digit code to your {type}. Enter it below to verify your account.
                            </p>

                            {/* OTP progress dots */}
                            <div className="flex gap-1.5 mb-8">
                                {code.map((d, i) => (
                                    <div
                                        key={i}
                                        className="h-0.5 flex-1 rounded-full transition-all duration-300"
                                        style={{ background: d ? "var(--color-accent)" : "var(--color-border-subtle)" }}
                                    />
                                ))}
                            </div>

                            {/* OTP inputs */}
                            <div className="flex gap-3 mb-10" onPaste={handlePaste}>
                                {code.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => { inputs.current[i] = el; }}
                                        id={`otp-${i}`}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleInput(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className="otp-cell"
                                        autoFocus={i === 0}
                                        aria-label={`Digit ${i + 1}`}
                                    />
                                ))}
                            </div>

                            <motion.button
                                onClick={() => handleVerify()}
                                disabled={loading || !allFilled}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full py-4 rounded-xl bg-accent text-base font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ boxShadow: allFilled ? "0 0 32px rgba(0,212,216,0.25)" : "none", transition: "box-shadow 0.3s" }}
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
                                        Verifying...
                                    </span>
                                ) : (
                                    <><ShieldCheck size={18} /><span>Verify account</span></>
                                )}
                            </motion.button>

                            {/* Resend */}
                            <div className="flex items-center justify-center gap-2 mt-8">
                                <span className="text-[13px] text-tertiary">Didn&apos;t receive it?</span>
                                <button
                                    onClick={handleResend}
                                    disabled={resendCooldown > 0}
                                    className="flex items-center gap-1.5 text-[13px] text-accent hover:text-accent-dark disabled:text-tertiary disabled:cursor-not-allowed transition-colors"
                                >
                                    <RotateCcw size={13} />
                                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                                </button>
                            </div>

                            <Link
                                href="/login"
                                className="flex items-center gap-2 justify-center mt-6 text-[13px] text-tertiary hover:text-accent transition-colors"
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
                            <div className="relative mx-auto mb-8 w-20 h-20">
                                <div className="absolute inset-0 rounded-full bg-accent/15 animate-ping opacity-30" />
                                <div className="relative w-20 h-20 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
                                    <CheckCircle2 size={36} className="text-accent" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold tracking-tight text-primary mb-3">Verified!</h2>
                            <p className="text-secondary text-[15px]">Redirecting to your dashboard...</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-base flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
