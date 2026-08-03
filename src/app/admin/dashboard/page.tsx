"use client";
import { useEffect, useState } from "react";
import { Shield, Users, Activity, DollarSign, Command } from "lucide-react";
import { NanoCard } from "@/components/ui-nano";

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch("/api/admin/stats").then(r => r.json()).then(setStats);
    }, []);

    if (!stats) return <div className="min-h-screen bg-background flex items-center justify-center font-black animate-pulse opacity-20 italic">NULL_STATE...</div>;

    return (
        <div className="min-h-screen bg-base text-primary p-10 font-sans">
            <header className="flex items-center gap-6 mb-32">
                <div className="w-16 h-16 bg-accent text-base rounded-[16px] flex items-center justify-center shadow-[0_0_40px_rgba(0,212,216,0.2)]">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-5xl font-display font-bold tracking-tight text-primary">Command Center.</h1>
                    <p className="text-tertiary font-mono text-[13px] uppercase tracking-widest mt-1">Admin Oversight</p>
                </div>
            </header>

            <section className="grid md:grid-cols-4 gap-4 mb-20">
                {[
                    { icon: Users, label: "Total Users", val: stats.users, trend: "UP" },
                    { icon: Activity, label: "Throughput", val: stats.tokens.toLocaleString(), trend: "UP" },
                    { icon: DollarSign, label: "Revenue", val: `$${stats.revenue}`, trend: "UP" },
                    { icon: Command, label: "Nodes", val: stats.nodes, trend: "STR" }
                ].map((s, i) => (
                    <NanoCard key={i} className="hover:border-accent/30 transition-all group bg-raised border-border-subtle p-6 rounded-[24px]">
                        <div className="flex justify-between items-center mb-6">
                            <s.icon className="text-tertiary group-hover:text-accent transition-colors" size={24} />
                            <span className="text-[10px] font-mono tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-[4px] border border-accent/20 uppercase">{s.trend}</span>
                        </div>
                        <h4 className="text-[11px] font-mono uppercase tracking-widest text-tertiary mb-1">{s.label}</h4>
                        <div className="text-3xl font-display font-semibold text-primary">{s.val}</div>
                    </NanoCard>
                ))}
            </section>

            <div className="bg-raised rounded-[24px] border border-border-subtle overflow-hidden">
                <div className="p-8 border-b border-border-subtle flex justify-between items-center">
                    <h3 className="text-[16px] font-display font-semibold text-primary">System Logs</h3>
                    <span className="text-[11px] font-mono text-tertiary uppercase tracking-widest flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
                        Status: Nominal
                    </span>
                </div>
                <table className="w-full text-left">
                    <thead className="text-[11px] font-mono text-tertiary uppercase tracking-widest bg-overlay border-b border-border-subtle">
                        <tr>
                            <th className="px-8 py-4 font-normal">Entity ID</th>
                            <th className="px-8 py-4 font-normal">Tier</th>
                            <th className="px-8 py-4 font-normal">Saturation</th>
                            <th className="px-8 py-4 font-normal text-right">Interrupt</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] font-medium text-secondary">
                        {stats.recentUsers.map((u: any, i: number) => (
                            <tr key={i} className="border-b border-border-subtle hover:bg-overlay/50 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="text-primary">{u.email}</div>
                                    <div className="text-[11px] text-tertiary font-mono uppercase tracking-widest mt-1">{u.id}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="px-3 py-1 bg-overlay border border-border-subtle rounded-full text-[11px] font-mono text-tertiary uppercase tracking-widest">{u.plan}</span>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="w-32 h-1.5 bg-overlay rounded-full overflow-hidden border border-border-subtle">
                                        <div className="h-full bg-accent" style={{ width: `${u.saturation}%` }} />
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <button className="text-[11px] font-mono text-tertiary group-hover:text-error transition-colors uppercase tracking-widest">Kill</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
