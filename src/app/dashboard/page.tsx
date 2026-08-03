"use client";
import { FolderOpen, Plus, TrendingUp, Zap, Cpu, Globe, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { Card, Button, Badge, H2 } from "@/components/ui-nano";

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

export default function DashboardOverview() {
    const router = useRouter();
    const { data, projects } = useDashboard();
    
    if (!data) return null;
    const saturation = data.usage.limit > 0 ? Math.min(100, Math.round((data.usage.total / data.usage.limit) * 100)) : 0;

    return (
        <div className="max-w-[1200px] mx-auto space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="flex items-start justify-between">
                    <div>
                        <H2 className="text-primary tracking-tight">Overview</H2>
                        <p className="text-[14px] text-secondary mt-1">{projects.length} {projects.length === 1 ? 'Project' : 'Projects'} Active</p>
                    </div>
                    <Button
                        variant="primary"
                        onClick={() => router.push("/dashboard/projects?create=true")}
                        className="flex items-center gap-2"
                    >
                        <Plus size={16} /> New Project
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { icon: FolderOpen, label: "Active Projects", value: projects.length },
                        { icon: TrendingUp, label: "Total Requests", value: fmt(data.usage.total) },
                        { icon: Zap, label: "Avg Latency", value: "112ms" },
                        { icon: Cpu, label: "Compute Usage", value: `${saturation}%` },
                    ].map((s, i) => (
                        <Card key={i} className="flex flex-col p-6 hover:border-border-hover transition-colors">
                            <div className="flex justify-between items-start mb-4">
                                <div className="text-[13px] font-medium text-secondary">{s.label}</div>
                                <div className="p-1.5 rounded-[6px] bg-accent/10 border border-accent/20 text-accent">
                                    <s.icon size={14} />
                                </div>
                            </div>
                            <div className="text-3xl font-display font-semibold text-primary">{s.value}</div>
                        </Card>
                    ))}
                </div>

                <Card className="p-6 md:p-8 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[14px] font-medium text-primary">Monthly Quota</span>
                        <Badge variant="aqua">{saturation}%</Badge>
                    </div>
                    <div className="h-2 bg-overlay rounded-full overflow-hidden border border-border-subtle">
                        <div
                            className="h-full bg-accent transition-all duration-1000"
                            style={{ width: `${saturation}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[12px] text-secondary mt-3 font-mono">
                        <span>{fmt(data.usage.total)} Used</span>
                        <span>{fmt(data.usage.limit)} Total</span>
                    </div>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-between items-center px-1">
                        <h3 className="text-[14px] font-medium text-primary">Recent Projects</h3>
                    </div>
                    {projects.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                            <Globe size={32} className="text-tertiary mb-4" />
                            <p className="text-[14px] text-secondary mb-4">No active projects discovered.<br/>Initialize a project to start processing requests.</p>
                            <Button variant="secondary" onClick={() => router.push("/dashboard/projects?create=true")}>
                                Create Project
                            </Button>
                        </Card>
                    ) : (
                        <Card noPadding className="overflow-hidden">
                            {projects.slice(0, 3).map((p, index) => (
                                <div
                                    key={p.id}
                                    className={`flex items-center justify-between px-6 py-4 hover:bg-overlay/50 transition-colors cursor-pointer group ${index !== 0 ? 'border-t border-border-subtle' : ''}`}
                                    onClick={() => router.push(`/dashboard/projects?id=${p.id}`)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-9 h-9 rounded-[8px] bg-raised border border-border-subtle flex items-center justify-center group-hover:bg-accent/10 group-hover:border-accent/20 transition-colors">
                                            <FolderOpen size={16} className="text-secondary group-hover:text-accent transition-colors" />
                                        </div>
                                        <div>
                                            <p className="text-[14px] font-medium text-primary">{p.name}</p>
                                            <div className="flex items-center gap-3 mt-1 text-[12px] text-tertiary font-mono">
                                                <span>{p.conversations} Logs</span>
                                                <span className="w-1 h-1 rounded-full bg-tertiary/30" />
                                                <span>{fmt(p.tokens)} Tokens</span>
                                            </div>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-tertiary group-hover:text-primary transition-colors" />
                                </div>
                            ))}
                        </Card>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
