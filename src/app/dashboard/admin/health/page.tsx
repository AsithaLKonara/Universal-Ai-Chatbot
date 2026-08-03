"use client";
import { useState } from "react";
import { NanoCard, H2} from "@/components/ui-nano";
import { Activity, Server, Database, Globe, RefreshCcw, Terminal } from "lucide-react";

export default function AdminHealthPage() {
    const [activeTab, setActiveTab] = useState<"metrics" | "webhooks">("metrics");

    const webhookLogs = [
        { id: "evt_1", source: "Stripe", type: "customer.subscription.created", status: 200, time: "2 mins ago" },
        { id: "evt_2", source: "WooCommerce", type: "order.created", status: 500, time: "15 mins ago" },
        { id: "evt_3", source: "Twilio", type: "message.received", status: 200, time: "1 hour ago" },
        { id: "evt_4", source: "WhatsApp", type: "message.received", status: 200, time: "2 hours ago" },
    ];

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <H2 className="text-primary mb-2">System Health</H2>
                    <p className="text-[13px] leading-relaxed text-secondary">Monitor platform infrastructure and global webhook event streams.</p>
                </div>
                <button className="bg-overlay text-primary border border-border-subtle px-4 py-2 rounded-[8px] text-[12px] font-semibold hover:border-accent/50 transition-colors flex items-center gap-2">
                    <RefreshCcw size={14} /> Refresh Data
                </button>
            </header>

            <div className="flex gap-4 mb-8 border-b border-border-subtle pb-4">
                <button onClick={() => setActiveTab("metrics")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "metrics" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <Activity size={16} /> Core Metrics
                </button>
                <button onClick={() => setActiveTab("webhooks")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "webhooks" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <Terminal size={16} /> Webhook Logs
                </button>
            </div>

            {activeTab === "metrics" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid md:grid-cols-3 gap-6">
                        <NanoCard className="p-6 bg-raised border-border-subtle">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-[12px] bg-overlay border border-border-subtle flex items-center justify-center text-primary">
                                    <Server size={20} />
                                </div>
                                <span className="w-2 h-2 rounded-full bg-state-success animate-pulse" />
                            </div>
                            <h3 className="text-[13px] font-mono uppercase tracking-widest text-tertiary mb-2">API Latency</h3>
                            <div className="text-3xl font-display font-semibold text-primary">45ms <span className="text-sm font-sans text-secondary font-normal">p95</span></div>
                        </NanoCard>

                        <NanoCard className="p-6 bg-raised border-border-subtle">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-[12px] bg-overlay border border-border-subtle flex items-center justify-center text-primary">
                                    <Database size={20} />
                                </div>
                                <span className="w-2 h-2 rounded-full bg-state-success animate-pulse" />
                            </div>
                            <h3 className="text-[13px] font-mono uppercase tracking-widest text-tertiary mb-2">Database Load</h3>
                            <div className="text-3xl font-display font-semibold text-primary">12% <span className="text-sm font-sans text-secondary font-normal">CPU</span></div>
                        </NanoCard>

                        <NanoCard className="p-6 bg-raised border-border-subtle">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-10 h-10 rounded-[12px] bg-overlay border border-border-subtle flex items-center justify-center text-primary">
                                    <Globe size={20} />
                                </div>
                                <span className="w-2 h-2 rounded-full bg-state-warning animate-pulse" />
                            </div>
                            <h3 className="text-[13px] font-mono uppercase tracking-widest text-tertiary mb-2">Inference Queue</h3>
                            <div className="text-3xl font-display font-semibold text-state-warning">142 <span className="text-sm font-sans text-secondary font-normal">Jobs Pending</span></div>
                        </NanoCard>
                    </div>

                    <div className="bg-raised rounded-[24px] border border-border-subtle p-8 mt-6">
                        <h3 className="text-xl font-display font-semibold text-primary mb-6">System Architecture Map</h3>
                        <div className="h-64 bg-overlay border border-border-subtle rounded-[16px] flex items-center justify-center text-tertiary font-mono text-[13px] uppercase tracking-widest">
                            [Interactive Architecture Graph Placeholder]
                        </div>
                    </div>
                </div>
            )}

            {activeTab === "webhooks" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-[#0e0918] rounded-[24px] border border-border-subtle overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-base">
                            <div className="flex gap-2">
                                <div className="w-3 h-3 rounded-full bg-error" />
                                <div className="w-3 h-3 rounded-full bg-state-warning" />
                                <div className="w-3 h-3 rounded-full bg-state-success" />
                            </div>
                            <span className="text-[11px] font-mono text-tertiary uppercase tracking-widest">Incoming Event Stream</span>
                        </div>
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left font-mono text-[12px]">
                                <thead className="text-tertiary uppercase tracking-widest bg-base border-b border-border-subtle">
                                    <tr>
                                        <th className="px-6 py-4 font-normal">Time</th>
                                        <th className="px-6 py-4 font-normal">Source</th>
                                        <th className="px-6 py-4 font-normal">Event Type</th>
                                        <th className="px-6 py-4 font-normal">ID</th>
                                        <th className="px-6 py-4 font-normal">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="text-[#a09cba]">
                                    {webhookLogs.map(log => (
                                        <tr key={log.id} className="border-b border-border-subtle/50 hover:bg-overlay/30 transition-colors cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap">{log.time}</td>
                                            <td className="px-6 py-4 text-[#00D4D8]">{log.source}</td>
                                            <td className="px-6 py-4 text-[#8b5cf6]">{log.type}</td>
                                            <td className="px-6 py-4 text-tertiary">{log.id}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${log.status === 200 ? 'bg-state-success/10 text-state-success' : 'bg-error/10 text-error'}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
