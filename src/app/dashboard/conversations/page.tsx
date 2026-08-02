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
                        <h1 className="text-4xl font-black uppercase tracking-tightest">Signals.</h1>
                        <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Live Interaction Stream</p>
                    </div>
                    <div className="flex gap-3 items-center">
                        <select
                            value={filterProject}
                            onChange={e => { setFilterProject(e.target.value); setConvPage(0); }}
                            className="bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-tighter outline-none"
                        >
                            <option value="">ALL NODES</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button onClick={() => fetchConversations(convPage, filterProject)} className="p-2.5 bg-foreground/5 rounded-xl opacity-40 hover:opacity-100 transition-opacity">
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </div>

                {conversations.length === 0 ? (
                    <div className="rounded-[40px] border border-dashed border-foreground/10 p-20 text-center opacity-30">
                        <MessageSquare size={40} className="mx-auto mb-5" />
                        <p className="text-xs font-black uppercase tracking-widest">No active communication signals detected.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {conversations.map(c => (
                            <div key={c.id} className="p-8 rounded-[32px] border border-foreground/10 space-y-6 bg-foreground/[0.01] hover:border-foreground/30 transition-all group overflow-hidden">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full">{c.project.name}</span>
                                    </div>
                                    <span className="text-[10px] opacity-30 font-bold uppercase tracking-widest font-mono">{timeAgo(c.createdAt)}</span>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-5">
                                        <div className="w-8 h-8 rounded-full bg-foreground/5 flex-shrink-0 flex items-center justify-center text-[10px] font-black opacity-30">URS</div>
                                        <p className="text-sm font-medium opacity-90 leading-relaxed pt-1.5">{c.message}</p>
                                    </div>
                                    <div className="flex gap-5">
                                        <div className="w-8 h-8 rounded-full bg-accent/20 flex-shrink-0 flex items-center justify-center text-[10px] font-black text-accent shadow-[0_0_10px_rgba(59,130,246,0.2)]">AI</div>
                                        <div className="text-sm font-medium opacity-60 leading-relaxed pt-1.5 prose-invert max-w-none">
                                            <ReactMarkdown 
                                                components={{
                                                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                                    ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                    ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                    li: ({node, ...props}) => <li className="mb-1" {...props} />,
                                                    h1: ({node, ...props}) => <h1 className="text-lg font-black uppercase tracking-tight mb-2" {...props} />,
                                                    h2: ({node, ...props}) => <h2 className="text-base font-black uppercase tracking-tight mb-2" {...props} />,
                                                    code: ({node, ...props}) => <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
                                                    pre: ({node, ...props}) => <pre className="bg-white/5 p-3 rounded-xl overflow-x-auto text-[13px] font-mono mb-2" {...props} />,
                                                }}
                                            >
                                                {c.response || "..."}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {convTotal > 20 && (
                            <div className="flex justify-between items-center px-4 pt-4 opacity-50">
                                <button disabled={convPage === 0} onClick={() => setConvPage(p => p - 1)} className="text-[10px] font-black uppercase tracking-widest hover:text-white disabled:opacity-20">Newer</button>
                                <span className="text-[10px] font-black uppercase tracking-widest">Page {convPage + 1} of {Math.ceil(convTotal / 20)}</span>
                                <button disabled={(convPage + 1) * 20 >= convTotal} onClick={() => setConvPage(p => p + 1)} className="text-[10px] font-black uppercase tracking-widest hover:text-white disabled:opacity-20">Older</button>
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
