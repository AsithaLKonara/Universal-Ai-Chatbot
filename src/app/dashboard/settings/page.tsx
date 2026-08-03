"use client";
import { useState } from "react";
import { NanoCard, H2} from "@/components/ui-nano";
import { Users, CreditCard, Key, Shield, UserPlus, MoreVertical, Check, Trash2 } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useEffect } from "react";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<"team" | "billing" | "api">("team");
    const { projects } = useDashboard();
    const projectId = projects?.[0]?.id; // Defaulting to first project
    const [team, setTeam] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTeam = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) {
                const data = await res.json();
                setTeam(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === "team") fetchTeam();
    }, [activeTab, projectId]);

    const inviteMember = async () => {
        if (!projectId) return;
        const email = prompt("Enter the email of the user to invite (must be a registered user):");
        if (!email) return;
        
        try {
            const res = await fetch(`/api/projects/${projectId}/members`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({ email, role: "EDITOR" })
            });
            if (res.ok) {
                alert("Member invited successfully!");
                fetchTeam();
            } else {
                const err = await res.json();
                alert(err.error || "Failed to invite member.");
            }
        } catch (e) {
            alert("Connection error.");
        }
    };

    return (
        <div className="p-10 max-w-5xl">
            <header className="mb-12">
                <H2 className="text-primary mb-2">Workspace Settings</H2>
                <p className="text-[13px] leading-relaxed text-secondary">Manage your team, billing, and developer keys.</p>
            </header>

            <div className="flex gap-4 mb-8 border-b border-border-subtle pb-4">
                <button onClick={() => setActiveTab("team")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "team" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <Users size={16} /> Team
                </button>
                <button onClick={() => setActiveTab("billing")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "billing" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <CreditCard size={16} /> Billing
                </button>
                <button onClick={() => setActiveTab("api")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "api" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <Key size={16} /> API Keys
                </button>
            </div>

            {activeTab === "team" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-display font-semibold text-primary">Team Members</h3>
                            <p className="text-sm text-tertiary mt-1">Manage who has access to this workspace.</p>
                        </div>
                        <button onClick={inviteMember} className="bg-primary text-base px-5 py-2.5 rounded-[8px] text-[13px] font-semibold hover:opacity-90 flex items-center gap-2">
                            <UserPlus size={16} /> Invite Member
                        </button>
                    </div>

                    <div className="bg-raised rounded-[24px] border border-border-subtle overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="text-[11px] font-mono text-tertiary uppercase tracking-widest bg-overlay border-b border-border-subtle">
                                <tr>
                                    <th className="px-6 py-4 font-normal">User</th>
                                    <th className="px-6 py-4 font-normal">Role</th>
                                    <th className="px-6 py-4 font-normal">Status</th>
                                    <th className="px-6 py-4 font-normal text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-[13px] font-medium text-secondary">
                                {team.map((member) => (
                                    <tr key={member.id} className="border-b border-border-subtle hover:bg-overlay/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="text-primary">{member.user?.name || "Unknown"}</div>
                                            <div className="text-[11px] text-tertiary font-mono">{member.user?.email || "Unknown"}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 bg-overlay border border-border-subtle rounded-full text-[11px] font-mono text-tertiary uppercase tracking-widest">
                                                {member.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${member.status === 'Active' || !member.status ? 'bg-state-success' : 'bg-state-warning'}`} />
                                                <span className="text-[12px]">{member.status || "Active"}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-tertiary hover:text-primary transition-colors p-2">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === "billing" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <div className="grid md:grid-cols-2 gap-6">
                        <NanoCard className="p-8 bg-raised border-border-subtle">
                            <div className="w-12 h-12 bg-accent/10 rounded-[16px] border border-accent/20 flex items-center justify-center text-accent mb-6">
                                <Shield size={24} />
                            </div>
                            <h3 className="text-[13px] font-mono uppercase tracking-widest text-tertiary mb-2">Current Plan</h3>
                            <div className="text-4xl font-display font-semibold text-primary mb-2">Pro <span className="text-xl text-tertiary">/ $29</span></div>
                            <p className="text-sm text-secondary mb-6">Billed monthly. Renews on Aug 24.</p>
                            <button className="w-full bg-overlay text-primary border border-border-subtle px-4 py-2.5 rounded-[8px] text-[13px] font-semibold hover:border-accent/50 transition-colors">
                                Manage Subscription (Stripe)
                            </button>
                        </NanoCard>
                        <NanoCard className="p-8 bg-raised border-border-subtle">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-[13px] font-mono uppercase tracking-widest text-tertiary mb-2">Usage Cycle</h3>
                                    <div className="text-3xl font-display font-semibold text-primary">124k <span className="text-lg text-tertiary">/ 500k</span></div>
                                </div>
                                <span className="px-3 py-1 bg-overlay border border-border-subtle rounded-[4px] text-[10px] font-mono text-tertiary uppercase tracking-widest">
                                    Tokens
                                </span>
                            </div>
                            <div className="w-full h-2 bg-overlay rounded-full overflow-hidden border border-border-subtle mb-4">
                                <div className="h-full bg-accent w-1/4" />
                            </div>
                            <p className="text-sm text-secondary">You have used 24.8% of your included monthly tokens.</p>
                        </NanoCard>
                    </div>
                </div>
            )}

            {activeTab === "api" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <NanoCard className="p-8 bg-raised border-border-subtle">
                        <h3 className="text-xl font-display font-semibold text-primary mb-2">Developer Keys</h3>
                        <p className="text-sm text-secondary mb-8">Use these keys to authenticate API requests to OmniChat.</p>

                        <div className="bg-overlay border border-border-subtle p-6 rounded-[16px] mb-6">
                            <label className="block text-[12px] font-mono uppercase tracking-widest text-tertiary mb-2">Production Key</label>
                            <div className="flex gap-4">
                                <input type="password" readOnly value="sk_live_omni_8f92a4bc03e1..." className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] font-mono text-primary outline-none" />
                                <button className="bg-primary text-base px-6 py-3 rounded-[8px] text-[13px] font-semibold hover:opacity-90 whitespace-nowrap">
                                    Copy Key
                                </button>
                            </div>
                        </div>

                        <button className="text-[13px] text-error hover:opacity-80 font-semibold flex items-center gap-2">
                            <Trash2 size={16} /> Roll API Keys
                        </button>
                    </NanoCard>
                </div>
            )}
        </div>
    );
}
