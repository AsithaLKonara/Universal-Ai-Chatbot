"use client";
import { useState } from "react";
import { NanoCard } from "@/components/ui-nano";
import { Command, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 nano-gradient">
            <Link href="/" className="mb-20 opacity-20 hover:opacity-100 transition-opacity"><Command size={48} /></Link>
            <NanoCard className="w-full max-w-md p-12">
                <h1 className="text-4xl font-black uppercase tracking-tightest mb-2">Login.</h1>
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest mb-10">Authorize Access Protocol</p>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4">Entity Identifier</label>
                        <input
                            className="w-full bg-border/30 border border-transparent focus:border-foreground/20 px-4 py-4 rounded-2xl outline-none transition-all text-sm font-bold"
                            placeholder="e.g. user@system.ai"
                            value={email} onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest opacity-30 px-4">Passcode</label>
                        <input
                            type="password"
                            className="w-full bg-border/30 border border-transparent focus:border-foreground/20 px-4 py-4 rounded-2xl outline-none transition-all text-sm font-bold"
                            placeholder="••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button className="w-full py-5 bg-foreground text-background font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-2xl transition-transform active:scale-[0.98] flex items-center justify-center gap-2">
                        Confirm <ArrowRight size={16} />
                    </button>
                </div>

                <div className="mt-10 text-center">
                    <Link href="/register" className="text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-all">Request New Assignment</Link>
                </div>
            </NanoCard>
        </div>
    );
}
