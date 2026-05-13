"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Command, ArrowLeft, Mail, ShieldAlert, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!email) return;
        setLoading(true);
        // Mocking recovery flow
        setTimeout(() => {
            setSent(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-[#fafafa] flex items-center justify-center p-6 font-sans selection:bg-accent/30 overflow-hidden relative">
            
            {/* Background effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/5 rounded-full blur-[160px] pointer-events-none" />

            <div className="w-full max-w-[440px] relative z-10">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-3xl space-y-8"
                >
                    {!sent ? (
                        <>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/10">
                                    <ShieldAlert size={20} className="text-accent" />
                                </div>
                                <h1 className="text-3xl font-black uppercase tracking-tightest leading-none">Recover.</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-4">Credentials Retrieval Sequence</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4 flex items-center gap-2"><Mail size={12} /> Registry Identifier</label>
                                <input
                                    className="w-full bg-white/[0.04] border border-white/10 focus:border-accent/50 px-6 py-5 rounded-[24px] outline-none transition-all text-sm font-bold placeholder:opacity-20"
                                    placeholder="IDENTIFIER@SYSTEM.AI"
                                    value={email} onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <button 
                                onClick={handleReset}
                                disabled={loading || !email}
                                className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[24px] shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.02] disabled:opacity-30 disabled:scale-100"
                            >
                                {loading ? "Broadcasting..." : "Initiate Recovery"}
                            </button>
                        </>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="text-center space-y-6 py-4"
                        >
                            <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={32} className="text-accent" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tightest">Sequence Active.</h2>
                            <p className="text-xs font-medium text-white/40 leading-relaxed px-4">
                                If the identifier exists within the registry, a recovery link has been broadcasted to your primary node.
                            </p>
                            <Link href="/login" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-accent hover:text-white transition-colors pt-4">
                                <ArrowLeft size={14} /> Return to Access Point
                            </Link>
                        </motion.div>
                    )}

                    {!sent && (
                        <div className="pt-2 flex justify-center border-t border-white/5">
                            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-accent transition-all pt-6 flex items-center gap-2">
                                <ArrowLeft size={12} /> Abort Recovery
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
