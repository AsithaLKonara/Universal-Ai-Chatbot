"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Command, ArrowRight, ShieldCheck, Mail, Lock, User, UserCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar, Footer } from "@/components/ui-nano";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleRegister = async () => {
        if (!name || !email || !password) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password })
            });

            if (res.ok) {
                router.push("/login?registered=true");
            } else {
                const data = await res.json();
                setError(data.error || "Registration Failed");
            }
        } catch (e) {
            setError("Neural Link Interrupted");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-[#fafafa] font-sans selection:bg-accent/30 relative">
            <Navbar />
            
            {/* Cinematic Background Frame */}
            <div className="fixed inset-0 z-0">
                <img 
                    src="/frames/frame_0300.jpg" 
                    className="w-full h-full object-cover opacity-30 grayscale-[0.5]" 
                    alt="Background"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen pt-32">
                <div className="flex-grow flex items-center justify-center p-6">
                    <div className="w-full max-w-[480px]">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col items-center mb-10"
                        >
                            <Link href="/" className="w-14 h-14 bg-white text-black rounded-[20px] flex items-center justify-center mb-10 shadow-2xl hover:scale-110 transition-all border border-white/10">
                                <Command size={24} />
                            </Link>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                            className="p-10 rounded-[48px] bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-3xl space-y-8"
                        >
                            <div className="text-center">
                                <h1 className="text-4xl font-black uppercase tracking-tightest leading-none">Initialize.</h1>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mt-4">Node Origin Sequence</p>
                            </div>

                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[10px] font-black uppercase tracking-widest">
                                    <AlertCircle size={14} /> {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4 flex items-center gap-2"><User size={12} /> Full Name</label>
                                    <input
                                        className="w-full bg-white/[0.04] border border-white/10 focus:border-accent/50 px-6 py-5 rounded-[24px] outline-none transition-all text-sm font-bold placeholder:opacity-20"
                                        placeholder="ALAN TURING"
                                        value={name} onChange={e => setName(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4 flex items-center gap-2"><Mail size={12} /> Email Protocol</label>
                                    <input
                                        className="w-full bg-white/[0.04] border border-white/10 focus:border-accent/50 px-6 py-5 rounded-[24px] outline-none transition-all text-sm font-bold placeholder:opacity-20"
                                        placeholder="ALAN@SYSTEM.AI"
                                        value={email} onChange={e => setEmail(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4 flex items-center gap-2"><Lock size={12} /> Secure Key</label>
                                    <input
                                        type="password"
                                        className="w-full bg-white/[0.04] border border-white/10 focus:border-accent/50 px-6 py-5 rounded-[24px] outline-none transition-all text-sm font-bold placeholder:opacity-20"
                                        placeholder="••••••••"
                                        value={password} onChange={e => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={handleRegister}
                                disabled={loading || !email || !password || !name}
                                className="w-full py-6 bg-white text-black font-black text-xs uppercase tracking-widest rounded-[24px] shadow-2xl transition-all active:scale-[0.98] hover:scale-[1.02] disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-3 group"
                            >
                                {loading ? "Initializing..." : (
                                    <>Confirm Sequence <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                                )}
                            </button>

                            <div className="pt-2 flex justify-center border-t border-white/5">
                                <Link href="/login" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-accent transition-all pt-6">Resume Existing Session</Link>
                            </div>
                        </motion.div>

                        <div className="mt-12 flex justify-center items-center gap-3 opacity-20 hover:opacity-50 transition-opacity">
                            <UserCheck size={14} />
                            <span className="text-[9px] font-black uppercase tracking-widest">Biometric Compliance Verified</span>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </div>
    );
}
