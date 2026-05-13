"use client";
import { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { Command, ShieldCheck, Zap, Smartphone, Mail, ArrowRight, RefreshCcw } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

function VerifyContent() {
    const [code, setCode] = useState(["", "", "", "", "", ""]);
    const [loading, setLoading] = useState(false);
    const [type, setType] = useState<"email" | "phone">("email");
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const t = searchParams.get("type");
        if (t === "phone") setType("phone");
    }, [searchParams]);

    const handleInput = (index: number, value: string) => {
        if (value.length > 1) value = value.slice(-1);
        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);

        // Auto focus next
        if (value && index < 5) {
            const next = document.getElementById(`code-${index + 1}`);
            next?.focus();
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        // Mock verification
        setTimeout(() => {
            router.push("/dashboard?verified=true");
            setLoading(false);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6 font-sans selection:bg-accent/30 overflow-hidden relative">
            
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-20" />

            <div className="w-full max-w-[480px] relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    className="p-12 rounded-[56px] bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-3xl space-y-10"
                >
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 bg-accent/10 border border-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            {type === "email" ? <Mail className="text-accent" size={24} /> : <Smartphone className="text-accent" size={24} />}
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tightest leading-none">Verify.</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">
                            Neural Security Handshake: {type}
                        </p>
                    </div>

                    <div className="flex justify-between gap-3">
                        {code.map((digit, i) => (
                            <input
                                key={i}
                                id={`code-${i}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleInput(i, e.target.value)}
                                className="w-14 h-20 bg-white/[0.04] border border-white/10 focus:border-accent/50 focus:bg-white/[0.08] text-2xl font-black text-center rounded-2xl outline-none transition-all text-white"
                            />
                        ))}
                    </div>

                    <div className="space-y-6">
                        <button 
                            onClick={handleVerify}
                            disabled={loading || code.some(d => !d)}
                            className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[24px] shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.02] disabled:opacity-20 flex items-center justify-center gap-3"
                        >
                            {loading ? "Authenticating Node..." : (
                                <>Complete Handshake <Zap size={18} /></>
                            )}
                        </button>

                        <button className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity">
                            <RefreshCcw size={12} /> Re-transmit Protocol
                        </button>
                    </div>
                </motion.div>

                <div className="mt-12 flex justify-center items-center gap-4 opacity-20">
                    <ShieldCheck size={14} />
                    <span className="text-[9px] font-black uppercase tracking-widest">End-to-End Neural Encryption Enabled</span>
                </div>
            </div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
                <div className="text-white text-[10px] font-black uppercase tracking-[0.5em] animate-pulse">Initializing Security Protocol...</div>
            </div>
        }>
            <VerifyContent />
        </Suspense>
    );
}
