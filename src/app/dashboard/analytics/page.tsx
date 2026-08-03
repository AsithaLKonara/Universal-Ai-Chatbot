"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
    TrendingUp, TrendingDown, Zap, AlertTriangle,
    ShoppingCart, Target, Activity, BarChart3
} from "lucide-react";

interface AnalyticsData {
    roi: {
        totalRevenue: number;
        aiAssistedRevenue: number;
        tokenCostUsd: number;
        roiMultiplier: number;
    };
    signals: {
        avgPurchaseIntent: number;
        avgAbandonmentRisk: number;
        accelerateCount: number;
        rescueCount: number;
        nurtureCount: number;
        totalSessions: number;
    };
    topEvents: {
        name: string;
        count: number;
    }[];
}

function StatCard({
    icon: Icon,
    label,
    value,
    sub,
    ion = false,
    warn = false,
}: {
    icon: any;
    label: string;
    value: string;
    sub?: string;
    ion?: boolean;
    warn?: boolean;
}) {
    return (
        <div
            className={`p-6 rounded-[24px] border transition-all group bg-raised space-y-4
                ${warn ? "border-orange-500/30 hover:border-orange-500/60 shadow-[0_0_20px_rgba(249,115,22,0.05)] hover:shadow-[0_0_30px_rgba(249,115,22,0.1)]" : 
                  ion ? "border-accent/30 hover:border-accent/60 shadow-[0_0_20px_rgba(0,212,216,0.05)] hover:shadow-[0_0_30px_rgba(0,212,216,0.1)]" : 
                  "border-border-subtle hover:border-accent/20"}`}
        >
            <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center opacity-70 group-hover:opacity-100 transition-opacity border
                ${warn ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : 
                  ion ? "bg-accent/10 text-accent border-accent/20" : 
                  "bg-overlay text-secondary border-border-subtle group-hover:text-primary"}`}>
                <Icon size={18} />
            </div>
            <div className="space-y-1">
                <div className="text-3xl font-display font-bold text-primary tracking-tight">{value}</div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-secondary">{label}</div>
                {sub && <div className="text-[10px] font-mono text-tertiary uppercase tracking-widest">{sub}</div>}
            </div>
        </div>
    );
}

function IntentBar({ label, value, color }: { label: string; value: number; color: string }) {
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[11px] font-mono uppercase tracking-widest">
                <span className="text-secondary">{label}</span>
                <span className="text-primary">{Math.round(value * 100)}%</span>
            </div>
            <div className="h-2 bg-overlay rounded-full overflow-hidden border border-border-subtle">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${value * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
        </div>
    );
}

function ActionBadge({ label, count, color }: { label: string; count: number; color: string }) {
    return (
        <div className={`flex items-center justify-between px-5 py-3 rounded-[12px] border bg-raised ${color}`}>
            <span className="text-[11px] font-mono uppercase tracking-widest">{label}</span>
            <span className="text-[16px] font-display font-semibold">{count}</span>
        </div>
    );
}

export default function AnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch analytics data from the API
        const token = localStorage.getItem("token");
        fetch("/api/user/analytics", {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        })
            .then((r) => r.json())
            .then((d) => setData(d))
            .catch(() => {
                // Fallback to illustrative mock data for demonstration
                setData({
                    roi: {
                        totalRevenue: 124850,
                        aiAssistedRevenue: 89400,
                        tokenCostUsd: 320,
                        roiMultiplier: 279.4,
                    },
                    signals: {
                        avgPurchaseIntent: 0.68,
                        avgAbandonmentRisk: 0.22,
                        accelerateCount: 142,
                        rescueCount: 38,
                        nurtureCount: 215,
                        totalSessions: 1203,
                    },
                    topEvents: [
                        { name: "product.viewed", count: 4821 },
                        { name: "cart.updated", count: 1340 },
                        { name: "checkout.started", count: 523 },
                        { name: "cart.abandoned.potential", count: 189 },
                        { name: "order.created", count: 312 },
                    ],
                });
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 md:p-10 flex items-center justify-center min-h-[400px]">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] opacity-20 animate-pulse">
                    Loading Intelligence Data...
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { roi, signals, topEvents } = data;
    const maxEventCount = Math.max(...topEvents.map((e) => e.count));

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
            >
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-display font-bold tracking-tight text-primary">Analytics.</h1>
                    <p className="text-[13px] font-mono text-tertiary uppercase tracking-widest mt-1">
                        Predictive Intelligence · ROI Dashboard
                    </p>
                </div>

                {/* ROI KPIs */}
                <div>
                    <h3 className="text-[11px] font-mono uppercase tracking-widest text-tertiary px-2 mb-4">
                        Revenue Intelligence
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard
                            icon={TrendingUp}
                            label="Total Revenue"
                            value={`$${(roi.totalRevenue / 1000).toFixed(1)}k`}
                            sub="All channels"
                            ion
                        />
                        <StatCard
                            icon={Zap}
                            label="AI-Assisted Revenue"
                            value={`$${(roi.aiAssistedRevenue / 1000).toFixed(1)}k`}
                            sub="Commerce loop"
                            ion
                        />
                        <StatCard
                            icon={BarChart3}
                            label="AI Cost"
                            value={`$${roi.tokenCostUsd}`}
                            sub="Token spend"
                        />
                        <StatCard
                            icon={Target}
                            label="ROI Multiplier"
                            value={`${roi.roiMultiplier.toFixed(0)}x`}
                            sub="Revenue per cost $"
                            ion
                        />
                    </div>
                </div>

                {/* Predictive Signals */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Intent & Risk Bars */}
                    <div className="p-8 rounded-[24px] border border-border-subtle bg-raised space-y-6">
                        <div className="text-[11px] font-mono uppercase tracking-widest text-tertiary">
                            Predictive Signals
                        </div>
                        <IntentBar
                            label="Avg Purchase Intent"
                            value={signals.avgPurchaseIntent}
                            color="bg-accent"
                        />
                        <IntentBar
                            label="Avg Abandonment Risk"
                            value={signals.avgAbandonmentRisk}
                            color="bg-orange-500"
                        />
                        <div className="pt-4 border-t border-border-subtle text-[11px] text-tertiary font-mono uppercase tracking-widest">
                            Based on {signals.totalSessions.toLocaleString()} sessions
                        </div>
                    </div>

                    {/* AI Intervention Breakdown */}
                    <div className="p-8 rounded-[24px] border border-border-subtle bg-raised space-y-4">
                        <div className="text-[11px] font-mono uppercase tracking-widest text-tertiary mb-4">
                            AI Intervention Actions
                        </div>
                        <ActionBadge
                            label="Accelerate (High Intent)"
                            count={signals.accelerateCount}
                            color="border-accent/20 text-accent bg-accent/5"
                        />
                        <ActionBadge
                            label="Rescue (Abandonment Risk)"
                            count={signals.rescueCount}
                            color="border-orange-500/20 text-orange-400 bg-orange-500/5"
                        />
                        <ActionBadge
                            label="Nurture (Engaged)"
                            count={signals.nurtureCount}
                            color="border-border-subtle text-secondary bg-overlay"
                        />
                        <div className="flex items-center gap-2 pt-2 text-[11px] text-tertiary font-mono uppercase tracking-widest">
                            <AlertTriangle size={14} className="text-orange-400" />
                            <span>
                                {Math.round((signals.rescueCount / signals.totalSessions) * 100)}% sessions
                                flagged for rescue
                            </span>
                        </div>
                    </div>
                </div>

                {/* Commerce Event Funnel */}
                <div className="p-8 rounded-[24px] border border-border-subtle bg-raised space-y-6">
                    <div className="flex items-center gap-2">
                        <Activity size={16} className="text-tertiary" />
                        <span className="text-[11px] font-mono uppercase tracking-widest text-tertiary">
                            Commerce Event Funnel
                        </span>
                    </div>
                    <div className="space-y-4">
                        {topEvents.map((ev, i) => {
                            const pct = (ev.count / maxEventCount) * 100;
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-mono uppercase tracking-widest">
                                        <span className="text-secondary">{ev.name}</span>
                                        <span className="text-primary">{ev.count.toLocaleString()}</span>
                                    </div>
                                    <div className="h-1.5 bg-overlay rounded-full overflow-hidden border border-border-subtle">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${pct}%` }}
                                            transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                            className={`h-full rounded-full ${
                                                i === 0 ? "bg-accent" :
                                                i === 1 ? "bg-accent/70" :
                                                i === 2 ? "bg-accent/50" :
                                                i === 3 ? "bg-orange-500" :
                                                "bg-border-strong"
                                            }`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    {/* Conversion Rate derived from funnel */}
                    {(() => {
                        const views = topEvents.find(e => e.name === "product.viewed")?.count || 1;
                        const orders = topEvents.find(e => e.name === "order.created")?.count || 0;
                        const convRate = ((orders / views) * 100).toFixed(1);
                        const abandonRate = (() => {
                            const cartEvents = topEvents.find(e => e.name === "cart.updated")?.count || 0;
                            const abandoned = topEvents.find(e => e.name === "cart.abandoned.potential")?.count || 0;
                            return cartEvents > 0 ? ((abandoned / cartEvents) * 100).toFixed(1) : "0.0";
                        })();
                        return (
                            <div className="flex gap-8 pt-6 border-t border-border-subtle">
                                <div>
                                    <div className="text-xl font-display font-bold text-accent">{convRate}%</div>
                                    <div className="text-[11px] text-tertiary font-mono uppercase tracking-widest mt-1">
                                        View → Order Rate
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xl font-display font-bold text-orange-500">{abandonRate}%</div>
                                    <div className="text-[11px] text-tertiary font-mono uppercase tracking-widest mt-1">
                                        Cart Abandon Rate
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xl font-display font-bold text-primary">{signals.totalSessions.toLocaleString()}</div>
                                    <div className="text-[11px] text-tertiary font-mono uppercase tracking-widest mt-1">
                                        Total Sessions
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </div>
            </motion.div>
        </div>
    );
}
