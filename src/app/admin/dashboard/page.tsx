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
        <div className="min-h-screen bg-background text-foreground p-10 font-sans">
            <header className="flex items-center gap-6 mb-32">
                <div className="w-16 h-16 bg-foreground text-background rounded-[24px] flex items-center justify-center shadow-2xl">
                    <Shield size={32} />
                </div>
                <div>
                    <h1 className="text-5xl font-black uppercase tracking-tightest">Command.System</h1>
                    <p className="opacity-40 font-black text-xs uppercase tracking-widest mt-1">Sovereign Oversight Protocol</p>
                </div>
            </header>

            <section className="grid md:grid-cols-4 gap-4 mb-20">
                {[
                    { icon: Users, label: "Entities", val: stats.users, trend: "UP" },
                    { icon: Activity, label: "Throughput", val: stats.tokens.toLocaleString(), trend: "UP" },
                    { icon: DollarSign, label: "Capital", val: `$${stats.revenue}`, trend: "UP" },
                    { icon: Activity, label: "Nodes", val: stats.nodes, trend: "STR" }
                ].map((s, i) => (
                    <NanoCard key={i} className="hover:border-foreground transition-all">
                        <div className="flex justify-between items-center mb-6">
                            <s.icon className="opacity-20" size={24} />
                            <span className="text-[10px] font-black tracking-widest bg-foreground text-background px-2 py-0.5 rounded uppercase">{s.trend}</span>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">{s.label}</h4>
                        <div className="text-3xl font-black">{s.val}</div>
                    </NanoCard>
                ))}
            </section>

            <div className="nano-glass rounded-[40px] border border-border overflow-hidden">
                <div className="p-10 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-widest">Incursion Logs</h3>
                    <span className="text-[10px] font-black opacity-30 uppercase">Status: Nominal</span>
                </div>
                <table className="w-full text-left">
                    <thead className="text-[10px] font-black opacity-20 uppercase tracking-[0.2em]">
                        <tr className="border-b border-border">
                            <th className="p-10">Entity ID</th>
                            <th className="p-10">Tier</th>
                            <th className="p-10">Saturation</th>
                            <th className="p-10 text-right">Interrupt</th>
                        </tr>
                    </thead>
                    <tbody className="text-xs font-black">
                        {stats.recentUsers.map((u: any, i: number) => (
                            <tr key={i} className="border-b border-border hover:bg-foreground/5 transition-colors group">
                                <td className="p-10">
                                    <div className="tracking-tighter uppercase">{u.email}</div>
                                    <div className="text-[10px] opacity-20 font-bold">{u.id}</div>
                                </td>
                                <td className="p-10"><span className="px-3 py-1 bg-border rounded-full text-[10px] uppercase">{u.plan}</span></td>
                                <td className="p-10">
                                    <div className="w-40 h-1 bg-border rounded-full overflow-hidden">
                                        <div className="h-full bg-foreground" style={{ width: `${u.saturation}%` }} />
                                    </div>
                                </td>
                                <td className="p-10 text-right">
                                    <button className="text-red-500 opacity-20 group-hover:opacity-100 transition-opacity uppercase tracking-widest font-black">Kill</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
