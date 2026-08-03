"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { MessageSquare, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useSearchParams } from "next/navigation";

function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

interface Conversation { 
    id: string; 
    projectId: string; 
    userId: string; 
    message: string; 
    response: string; 
    createdAt: string; 
    project: { name: string }; 
}

function ConversationsContent() {
    const { projects } = useDashboard();
    const searchParams = useSearchParams();
    
    const [filterProject, setFilterProject] = useState<string>("");
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [convPage, setConvPage] = useState(0);
    const [convTotal, setConvTotal] = useState(0);

    useEffect(() => {
        const id = searchParams.get("projectId");
        if (id) {
            setFilterProject(id);
        }
    }, [searchParams]);

    const fetchConversations = useCallback(async (page = 0, projectId = "") => {
        try {
            const params = new URLSearchParams({ skip: String(page * 20), take: "20" });
            if (projectId) params.set("projectId", projectId);
            const res = await fetch(`/api/user/conversations?${params}`, { 
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
            });
            const json = await res.json();
            setConversations(json.conversations || []);
            setConvTotal(json.total || 0);
        } catch {}
    }, []);

    useEffect(() => {
        fetchConversations(convPage, filterProject);
    }, [convPage, filterProject, fetchConversations]);

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-bold tracking-tight text-primary">Conversations.</h1>
                        <p className="text-[13px] font-mono text-tertiary uppercase tracking-widest mt-1">Live Interaction Logs</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            value={filterProject}
                            onChange={e => { setFilterProject(e.target.value); setConvPage(0); }}
                            className="bg-raised border border-border-subtle rounded-[12px] px-4 py-2.5 text-[13px] font-medium text-primary outline-none hover:border-accent/20 focus:border-accent transition-colors"
                        >
                            <option value="">ALL PROJECTS</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={() => fetchConversations(convPage, filterProject)} className="p-2.5 bg-overlay border border-border-subtle text-secondary rounded-[12px] hover:text-accent hover:border-accent/30 transition-all">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {conversations.length === 0 ? (
                    <div className="rounded-[24px] border border-dashed border-border-subtle p-20 text-center text-tertiary">
                        <MessageSquare size={40} className="mx-auto mb-5 opacity-50" />
                        <p className="text-[13px] font-medium text-secondary">No active conversations found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {conversations.map(c => (
                            <div key={c.id} className="p-8 rounded-[24px] border border-border-subtle bg-raised hover:border-accent/30 hover:shadow-[0_4px_30px_rgba(0,212,216,0.05)] transition-all group overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                        <span className="text-[11px] font-mono uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">{c.project.name}</span>
                                    </div>
                                    <span className="text-[11px] text-tertiary font-mono uppercase tracking-widest">{timeAgo(c.createdAt)}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-overlay flex-shrink-0 flex items-center justify-center text-[11px] font-mono text-tertiary border border-border-subtle">USR</div>
                                        <p className="text-[14px] text-primary leading-relaxed pt-1.5">{c.message}</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full bg-accent/10 flex-shrink-0 flex items-center justify-center text-[11px] font-mono text-accent border border-accent/20 shadow-[0_0_10px_rgba(0,212,216,0.1)]">AI</div>
                                        <div className="text-[14px] text-secondary leading-relaxed pt-1.5 prose-invert max-w-none prose-p:mb-2 prose-p:last:mb-0 prose-ul:list-disc prose-ul:ml-4 prose-ol:list-decimal prose-ol:ml-4 prose-h1:text-[16px] prose-h1:font-display prose-h1:font-bold prose-h2:text-[14px] prose-h2:font-display prose-h2:font-bold prose-code:bg-overlay prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-[4px] prose-code:font-mono prose-code:text-[12px] prose-pre:bg-overlay prose-pre:p-4 prose-pre:rounded-[8px] prose-pre:overflow-x-auto">
                                            <ReactMarkdown>
                                                {c.response || "..."}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {convTotal > 20 && (
                            <div className="flex justify-between items-center px-4 pt-4 text-tertiary">
                                <button disabled={convPage === 0} onClick={() => setConvPage(p => p - 1)} className="text-[11px] font-mono uppercase tracking-widest hover:text-primary disabled:opacity-30 transition-colors">Newer</button>
                                <span className="text-[11px] font-mono uppercase tracking-widest">Page {convPage + 1} of {Math.ceil(convTotal / 20)}</span>
                                <button disabled={(convPage + 1) * 20 >= convTotal} onClick={() => setConvPage(p => p + 1)} className="text-[11px] font-mono uppercase tracking-widest hover:text-primary disabled:opacity-30 transition-colors">Older</button>
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </div>
    );
}

export default function DashboardConversations() {
    return (
        <Suspense fallback={<div className="p-10 opacity-50">Loading signals...</div>}>
            <ConversationsContent />
        </Suspense>
    );
}
