"use client";
import { useState, useEffect } from "react";
import { NanoCard, H2} from "@/components/ui-nano";
import { Plug, ShoppingCart, MessageCircle, Phone, Save, X } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

export default function IntegrationsPage() {
    const [activeConfig, setActiveConfig] = useState<string | null>(null);
    const { projects } = useDashboard();
    const projectId = projects?.[0]?.id;
    const [configData, setConfigData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (projectId) {
            fetch(`/api/projects/${projectId}/integrations`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            })
            .then(res => res.json())
            .then(data => setConfigData(data))
            .catch(console.error);
        }
    }, [projectId]);

    const handleSave = async (updates: any) => {
        if (!projectId) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/integrations`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                alert("Configuration saved!");
                setConfigData((prev: any) => ({ ...prev, ...updates }));
            } else {
                alert("Failed to save.");
            }
        } finally {
            setSaving(false);
        }
    };

    const integrations = [
        { id: "woo", name: "WooCommerce", icon: ShoppingCart, desc: "Sync products, inventory, and handle order inquiries.", status: configData.wooCommerceEnabled ? "Connected" : "Not Configured" },
        { id: "wa", name: "WhatsApp Meta", icon: MessageCircle, desc: "Deploy your assistant to a WhatsApp Business number.", status: configData.whatsappEnabled ? "Connected" : "Not Configured" },
        { id: "twilio", name: "Twilio SMS/Voice", icon: Phone, desc: "Handle inbound SMS and voice calls.", status: configData.twilioEnabled ? "Connected" : "Not Configured" }
    ];

    return (
        <div className="p-10 max-w-5xl">
            <header className="mb-12">
                <H2 className="text-primary mb-2">Integrations Config</H2>
                <p className="text-[13px] leading-relaxed text-secondary">Connect OmniChat to external platforms and sync your data.</p>
            </header>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {integrations.map(integ => (
                    <NanoCard key={integ.id} className="p-6 bg-raised border-border-subtle flex flex-col h-full cursor-pointer hover:border-accent/50 transition-colors" onClick={() => setActiveConfig(integ.id)}>
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-10 h-10 rounded-[12px] bg-overlay border border-border-subtle flex items-center justify-center text-primary">
                                <integ.icon size={20} />
                            </div>
                            <span className={`text-[10px] uppercase font-mono px-2 py-1 rounded-[4px] border ${integ.status === 'Connected' ? 'bg-state-success/10 text-state-success border-state-success/20' : 'bg-overlay text-tertiary border-border-subtle'}`}>
                                {integ.status}
                            </span>
                        </div>
                        <h3 className="text-[15px] font-semibold text-primary mb-2">{integ.name}</h3>
                        <p className="text-[13px] text-tertiary leading-relaxed flex-grow">{integ.desc}</p>
                    </NanoCard>
                ))}
            </div>

            {activeConfig && (
                <div className="bg-raised border border-border-subtle rounded-[24px] p-8 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <button onClick={() => setActiveConfig(null)} className="absolute top-6 right-6 text-tertiary hover:text-primary">
                        <X size={20} />
                    </button>
                    <h3 className="text-xl font-display font-semibold text-primary mb-6">Configure {integrations.find(i => i.id === activeConfig)?.name}</h3>
                    
                    <div className="space-y-6 max-w-2xl">
                        {activeConfig === "woo" && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleSave({
                                    wooCommerceEnabled: true,
                                    wooCommerceStoreUrl: formData.get("url"),
                                    wooCommerceKey: formData.get("key"),
                                    wooCommerceSecret: formData.get("secret")
                                });
                            }}>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Store URL</label>
                                    <input name="url" type="text" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.wooCommerceStoreUrl || ""} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Consumer Key</label>
                                    <input name="key" type="password" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.wooCommerceKey || ""} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Consumer Secret</label>
                                    <input name="secret" type="password" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.wooCommerceSecret || ""} />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="submit" disabled={saving} className="bg-primary text-base px-6 py-3 rounded-[8px] text-[13px] font-semibold hover:opacity-90 flex items-center gap-2">
                                        <Save size={16} /> Save Configuration
                                    </button>
                                </div>
                            </form>
                        )}
                        {activeConfig === "wa" && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleSave({
                                    whatsappEnabled: true,
                                    whatsappPhoneId: formData.get("phoneId"),
                                    whatsappToken: formData.get("token"),
                                    whatsappVerifyToken: formData.get("verifyToken")
                                });
                            }}>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Meta Phone ID</label>
                                    <input name="phoneId" type="text" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.whatsappPhoneId || ""} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Permanent Token</label>
                                    <input name="token" type="password" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.whatsappToken || ""} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Webhook Verify Token</label>
                                    <input name="verifyToken" type="text" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.whatsappVerifyToken || ""} />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="submit" disabled={saving} className="bg-primary text-base px-6 py-3 rounded-[8px] text-[13px] font-semibold hover:opacity-90 flex items-center gap-2">
                                        <Save size={16} /> Save Configuration
                                    </button>
                                </div>
                            </form>
                        )}
                        {activeConfig === "twilio" && (
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                handleSave({
                                    twilioEnabled: true,
                                    twilioPhoneNumber: formData.get("phone"),
                                    twilioAuthToken: formData.get("token")
                                });
                            }}>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Phone Number</label>
                                    <input name="phone" type="text" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.twilioPhoneNumber || ""} />
                                </div>
                                <div className="mb-4">
                                    <label className="block text-[12px] font-mono uppercase tracking-widest text-secondary mb-2">Auth Token</label>
                                    <input name="token" type="password" className="w-full bg-base border border-border-subtle rounded-[8px] px-4 py-3 text-[14px] text-primary focus:outline-none focus:border-accent" defaultValue={configData.twilioAuthToken || ""} />
                                </div>
                                <div className="pt-4 flex gap-4">
                                    <button type="submit" disabled={saving} className="bg-primary text-base px-6 py-3 rounded-[8px] text-[13px] font-semibold hover:opacity-90 flex items-center gap-2">
                                        <Save size={16} /> Save Configuration
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
