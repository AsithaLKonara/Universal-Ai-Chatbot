"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        supabase.from("projects").select("*").then(({ data }) => setProjects(data || []));
    }, []);

    return (
        <div className="min-h-screen bg-base text-primary p-8 flex flex-col items-center pt-20">
            <div className="w-full max-w-4xl space-y-10">
                <header>
                    <h1 className="text-4xl font-display font-bold tracking-tight text-primary">Admin Overview.</h1>
                    <p className="text-tertiary font-mono text-[13px] uppercase tracking-widest mt-1">Project Nodes</p>
                </header>
                <div className="grid gap-4">
                    {projects.map((p) => (
                        <div key={p.id} className="p-6 bg-raised border border-border-subtle rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:border-accent/30 transition-colors">
                            <h2 className="text-[16px] font-display font-semibold text-primary">{p.name}</h2>
                            <code className="text-[12px] font-mono bg-overlay border border-border-subtle px-3 py-1.5 rounded-[8px] mt-3 block text-tertiary break-all">{p.id}</code>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
