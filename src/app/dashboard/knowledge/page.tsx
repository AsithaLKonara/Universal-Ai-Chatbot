"use client";
import { useState } from "react";
import { NanoCard, H2} from "@/components/ui-nano";
import { FileText, Link as LinkIcon, AlignLeft, Plus, MoreVertical, Search, RefreshCw } from "lucide-react";

export default function KnowledgePage() {
    const [activeTab, setActiveTab] = useState<"files" | "crawlers" | "snippets">("files");

    const data = {
        files: [
            { id: "doc_1", name: "Refund_Policy.pdf", size: "2.4 MB", status: "Synced", updated: "2h ago" },
            { id: "doc_2", name: "Q3_Product_Specs.docx", size: "1.1 MB", status: "Processing", updated: "10m ago" },
            { id: "doc_3", name: "Employee_Handbook.pdf", size: "5.2 MB", status: "Failed", updated: "1d ago" }
        ],
        crawlers: [
            { id: "url_1", name: "Help Center", url: "https://support.omnichat.ai", status: "Synced", pages: 42 },
            { id: "url_2", name: "Pricing Page", url: "https://omnichat.ai/pricing", status: "Queued", pages: 1 }
        ],
        snippets: [
            { id: "snp_1", name: "Holiday Hours", preview: "We are closed on Dec 25th...", status: "Synced", chars: 142 }
        ]
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "Synced": return "bg-state-success/10 text-state-success border-state-success/20";
            case "Processing": return "bg-accent/10 text-accent border-accent/20";
            case "Queued": return "bg-overlay text-tertiary border-border-subtle";
            case "Failed": return "bg-error/10 text-error border-error/20";
            default: return "bg-overlay text-tertiary border-border-subtle";
        }
    };

    return (
        <div className="p-10 max-w-7xl mx-auto">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <H2 className="text-primary mb-2">Knowledge Base</H2>
                    <p className="text-[13px] leading-relaxed text-secondary">Manage documents, web crawlers, and snippets to ground your AI.</p>
                </div>
                <button className="bg-primary text-base px-5 py-2.5 rounded-[8px] text-[13px] font-semibold hover:opacity-90 flex items-center gap-2">
                    <Plus size={16} /> Add Data Source
                </button>
            </header>

            <div className="flex gap-4 mb-8 border-b border-border-subtle pb-4">
                <button onClick={() => setActiveTab("files")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "files" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <FileText size={16} /> Files
                </button>
                <button onClick={() => setActiveTab("crawlers")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "crawlers" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <LinkIcon size={16} /> Web Crawlers
                </button>
                <button onClick={() => setActiveTab("snippets")} className={`flex items-center gap-2 text-[13px] font-mono uppercase tracking-widest px-4 py-2 rounded-[8px] transition-colors ${activeTab === "snippets" ? "bg-accent/10 text-accent" : "text-tertiary hover:text-secondary"}`}>
                    <AlignLeft size={16} /> Text Snippets
                </button>
            </div>

            <div className="bg-raised rounded-[24px] border border-border-subtle overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="p-4 border-b border-border-subtle flex justify-between items-center">
                    <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={14} />
                        <input type="text" placeholder={`Search ${activeTab}...`} className="w-full bg-base border border-border-subtle rounded-full pl-9 pr-4 py-1.5 text-[12px] text-primary focus:outline-none focus:border-accent" />
                    </div>
                </div>

                <table className="w-full text-left">
                    <thead className="text-[11px] font-mono text-tertiary uppercase tracking-widest bg-overlay border-b border-border-subtle">
                        <tr>
                            <th className="px-6 py-4 font-normal">Name / Details</th>
                            <th className="px-6 py-4 font-normal">Embedding Status</th>
                            <th className="px-6 py-4 font-normal">Metrics</th>
                            <th className="px-6 py-4 font-normal text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-[13px] font-medium text-secondary">
                        {activeTab === "files" && data.files.map(item => (
                            <tr key={item.id} className="border-b border-border-subtle hover:bg-overlay/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-primary font-semibold">{item.name}</div>
                                    <div className="text-[11px] text-tertiary font-mono">Last updated: {item.updated}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {item.status === 'Processing' && <RefreshCw size={12} className="text-accent animate-spin" />}
                                        <span className={`px-2 py-0.5 border rounded-[4px] text-[10px] font-mono uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                                            {item.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-tertiary font-mono">{item.size}</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-tertiary hover:text-primary p-2"><MoreVertical size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {activeTab === "crawlers" && data.crawlers.map(item => (
                            <tr key={item.id} className="border-b border-border-subtle hover:bg-overlay/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-primary font-semibold">{item.name}</div>
                                    <div className="text-[11px] text-tertiary font-mono">{item.url}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 border rounded-[4px] text-[10px] font-mono uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-tertiary font-mono">{item.pages} Pages</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-tertiary hover:text-primary p-2"><MoreVertical size={16} /></button>
                                </td>
                            </tr>
                        ))}
                        {activeTab === "snippets" && data.snippets.map(item => (
                            <tr key={item.id} className="border-b border-border-subtle hover:bg-overlay/50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="text-primary font-semibold">{item.name}</div>
                                    <div className="text-[11px] text-tertiary font-mono">{item.preview}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-0.5 border rounded-[4px] text-[10px] font-mono uppercase tracking-widest ${getStatusStyle(item.status)}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-tertiary font-mono">{item.chars} Chars</td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-tertiary hover:text-primary p-2"><MoreVertical size={16} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
