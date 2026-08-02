"use client";
import { FolderOpen, Plus, TrendingUp, Zap, Cpu, Globe, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

export default function DashboardOverview() {
    const router = useRouter();
    const { data, projects } = useDashboard();
    
    if (!data) return null;
    const saturation = data.usage.limit > 0 ? Math.min(100, Math.round((data.usage.total / data.usage.limit) * 100)) : 0;

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tightest">Dashboard.</h1>
                        <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Holistic View · {projects.length} Nodes Online</p>
                    </div>
                    <button
                        onClick={() => router.push("/dashboard/projects?create=true")}
                        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter shadow-xl hover:scale-105 transition-transform"
                    >
                        <Plus size={14} /> Initialize Node
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { icon: FolderOpen, label: "Active Nodes", value: projects.length, sub: "Modules deployed" },
                        { icon: TrendingUp, label: "Throughput", value: fmt(data.usage.total), sub: "Tokens processed" },
                        { icon: Zap, label: "Traffic / 24h", value: fmt(data.usage.daily), sub: "Total interactions" },
                        { icon: Cpu, label: "Neural Load", value: `${saturation}%`, sub: `of ${fmt(data.usage.limit)} total` },
                    ].map((s, i) => (
                        <div key={i} className="p-6 rounded-[32px] border border-foreground/10 space-y-4 hover:border-foreground/30 transition-all group nano-glass">
                            <div className="w-10 h-10 rounded-full bg-foreground/5 flex items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                                <s.icon size={18} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-3xl font-black tracking-tighter">{s.value}</div>
                                <div className="text-[10px] font-black uppercase tracking-widest opacity-30">{s.label}</div>
                                <div className="text-[9px] opacity-20 uppercase tracking-widest font-bold">{s.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 rounded-[40px] border border-foreground/10 space-y-4 nano-glass">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                        <span>Plan Utilization Index</span>
                        <span>{saturation}%</span>
                    </div>
                    <div className="h-2.5 bg-foreground/5 rounded-full overflow-hidden p-0.5 border border-foreground/10">
                        <div
                            className="h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(59,130,246,0.4)]"
                            style={{ width: `${saturation}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[9px] opacity-20 font-bold uppercase tracking-widest">
                        <span>0.00 TPS</span><span>{fmt(data.usage.limit)} MAX</span>
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2">Top Performance Modules</h3>
                    {projects.length === 0 ? (
                        <div className="rounded-[40px] border border-dashed border-foreground/10 p-16 text-center opacity-30">
                            <Globe size={40} className="mx-auto mb-5" />
                            <p className="text-xs font-black uppercase tracking-widest leading-loose">No active neural nodes discovered.<br/>Initialize a project to stabilize synchronization.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {projects.slice(0, 3).map(p => (
                                <div
                                    key={p.id}
                                    className="flex items-center justify-between p-6 rounded-3xl border border-foreground/10 hover:border-foreground/30 transition-all bg-foreground/[0.02] group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center group-hover:bg-accent group-hover:text-white transition-all shadow-sm">
                                            <FolderOpen size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black uppercase tracking-tighter group-hover:text-accent transition-colors">{p.name}</p>
                                            <div className="flex gap-4 items-center mt-1">
                                                <p className="text-[10px] opacity-30 uppercase font-black tracking-widest">{p.conversations} LOGS</p>
                                                <div className="w-1 h-1 rounded-full bg-foreground/10" />
                                                <p className="text-[10px] opacity-30 uppercase font-black tracking-widest">{fmt(p.tokens)} TOKENS</p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/dashboard/projects?id=${p.id}`)}
                                        className="w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-foreground hover:text-background transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
