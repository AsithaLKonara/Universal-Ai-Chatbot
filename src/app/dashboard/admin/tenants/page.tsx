"use client";
import { useState, useEffect } from "react";
import { NanoCard, H2} from "@/components/ui-nano";
import { Users, Search, MoreHorizontal, ArrowUpRight } from "lucide-react";

export default function AdminTenantsPage() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/admin/tenants", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        .then(res => res.json())
        .then(data => {
            setTenants(Array.isArray(data) ? data : []);
            setLoading(false);
        })
        .catch(err => {
            console.error(err);
            setLoading(false);
        });
    }, []);

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <H2 className="text-primary mb-2">Tenants Directory</H2>
                    <p className="text-[13px] leading-relaxed text-secondary">Manage and monitor all workspaces across the OmniChat platform.</p>
                </div>
                <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={14} />
                    <input type="text" placeholder="Search tenants..." className="w-full bg-base border border-border-subtle rounded-full pl-9 pr-4 py-2 text-[13px] text-primary focus:outline-none focus:border-accent" />
                </div>
            </header>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <NanoCard className="p-6 bg-raised border-border-subtle">
                    <div className="flex items-center gap-3 mb-2 text-tertiary uppercase tracking-widest text-[11px] font-mono">
                        <Users size={14} /> Total Tenants
                    </div>
                    <div className="text-3xl font-display font-semibold text-primary">{loading ? "..." : tenants.length}</div>
                </NanoCard>
                <NanoCard className="p-6 bg-raised border-border-subtle">
                    <div className="flex items-center gap-3 mb-2 text-tertiary uppercase tracking-widest text-[11px] font-mono">
                        Active MRR
                    </div>
                    <div className="text-3xl font-display font-semibold text-primary">${loading ? "..." : (tenants.length * 99).toLocaleString()}</div>
                </NanoCard>
                <NanoCard className="p-6 bg-raised border-border-subtle">
                    <div className="flex items-center gap-3 mb-2 text-tertiary uppercase tracking-widest text-[11px] font-mono">
                        Total Users
                    </div>
                    <div className="text-3xl font-display font-semibold text-primary">{loading ? "..." : tenants.reduce((acc, t) => acc + (t.users || 0), 0)}</div>
                </NanoCard>
            </div>

            <div className="bg-raised rounded-[24px] border border-border-subtle overflow-hidden">
                <table className="w-full text-left">
                    <thead className="text-[11px] font-mono text-tertiary uppercase tracking-widest bg-overlay border-b border-border-subtle">
                        <tr>
                            <th className="px-6 py-4 font-normal">Workspace</th>
                            <th className="px-6 py-4 font-normal">Plan & MRR</th>
                            <th className="px-6 py-4 font-normal">Usage</th>
                            <th className="px-6 py-4 font-normal">Status</th>
                            <th className="px-6 py-4 font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] font-medium text-secondary">
                        {tenants.map(t => (
                            <tr key={t.id} className="border-b border-border-subtle hover:bg-overlay/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-primary font-semibold">{t.name}</div>
                                    <div className="text-[11px] text-tertiary font-mono">{t.owner}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-accent rounded-[4px] text-[10px] font-mono uppercase tracking-widest">{t.plan || "Pro"}</span>
                                        <span className="text-primary">{t.mrr || "$99"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-primary">{t.tokens} <span className="text-tertiary text-[11px] font-mono uppercase tracking-widest">Tokens</span></div>
                                    <div className="text-secondary text-[12px]">{t.users} active users</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${t.status === 'Active' ? 'bg-state-success' : 'bg-state-warning'}`} />
                                        <span className="text-[12px]">{t.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-tertiary hover:text-primary transition-colors p-2 inline-flex items-center gap-2 text-[12px]">
                                        Inspect <ArrowUpRight size={14} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
