"use client";
import { useState, useEffect, Suspense, useCallback } from "react";
import { BookOpen, Send, Trash2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard } from "@/components/dashboard/DashboardProvider";
import { useSearchParams } from "next/navigation";

function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

interface Knowledge { id: string; content: string; createdAt: string; }

function KnowledgeContent() {
    const { projects } = useDashboard();
    const searchParams = useSearchParams();
    
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");
    const [knowledge, setKnowledge] = useState<Knowledge[]>([]);
    const [newKnowledge, setNewKnowledge] = useState("");
    const [addingKnowledge, setAddingKnowledge] = useState(false);

    useEffect(() => {
        const id = searchParams.get("projectId");
        if (id) {
            setSelectedProjectId(id);
        } else if (projects.length > 0 && !selectedProjectId) {
            setSelectedProjectId(projects[0].id);
        }
    }, [searchParams, projects, selectedProjectId]);

    const fetchKnowledge = useCallback(async (projectId: string) => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/user/knowledge?projectId=${projectId}`, { 
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
            });
            const json = await res.json();
            setKnowledge(json || []);
        } catch {}
    }, []);

    useEffect(() => {
        if (selectedProjectId) fetchKnowledge(selectedProjectId);
    }, [selectedProjectId, fetchKnowledge]);

    const addKnowledge = async () => {
        if (!newKnowledge.trim() || !selectedProjectId) return;
        setAddingKnowledge(true);
        try {
            const res = await fetch("/api/user/knowledge", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ projectId: selectedProjectId, content: newKnowledge }),
            });
            if (res.ok) {
                const k = await res.json();
                setKnowledge(prev => [k, ...prev]);
                setNewKnowledge("");
            }
        } finally { setAddingKnowledge(false); }
    };

    const removeKnowledge = async (id: string) => {
        await fetch(`/api/user/knowledge?id=${id}`, { 
            method: "DELETE", 
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        });
        setKnowledge(prev => prev.filter(k => k.id !== id));
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tightest">Corpus.</h1>
                        <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Neural Context Management</p>
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedProjectId}
                            onChange={e => setSelectedProjectId(e.target.value)}
                            className="bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-2.5 text-xs font-black uppercase tracking-tighter outline-none min-w-[200px]"
                        >
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>

                <div className="p-8 rounded-[40px] border border-foreground/10 bg-foreground/[0.02] space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Ingest New Knowledge Stream</p>
                    <div className="space-y-4">
                        <textarea
                            className="w-full h-40 bg-foreground/5 border border-foreground/10 rounded-[32px] p-6 text-sm font-medium outline-none placeholder:opacity-20 resize-none focus:border-accent/40 transition-colors"
                            placeholder="Paste documentation, FAQs, or raw context here... The AI will use this in real-time."
                            value={newKnowledge}
                            onChange={e => setNewKnowledge(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                onClick={addKnowledge}
                                disabled={addingKnowledge || !newKnowledge.trim() || !selectedProjectId}
                                className="px-8 py-4 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-tighter flex items-center gap-2 disabled:opacity-40 hover:scale-[1.02] transition-transform"
                            >
                                <Send size={14} /> {addingKnowledge ? "Processing..." : "Inject into Neural Node"}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 px-2 flex items-center justify-between">
                        <span>Active Context Streams</span>
                        <span>{knowledge.length} Units</span>
                    </h3>
                    {knowledge.length === 0 ? (
                        <div className="rounded-[40px] border border-dashed border-foreground/10 p-20 text-center opacity-30">
                            <BookOpen size={40} className="mx-auto mb-5" />
                            <p className="text-xs font-black uppercase tracking-widest">No knowledge units indexed for this node.</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {knowledge.map(k => (
                                <div key={k.id} className="p-6 rounded-3xl border border-foreground/10 bg-foreground/[0.01] hover:bg-foreground/[0.02] transition-all group relative">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-2 opacity-30">
                                            <FileText size={12} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">{timeAgo(k.createdAt)}</span>
                                        </div>
                                        <button onClick={() => removeKnowledge(k.id)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                    <p className="text-sm opacity-70 line-clamp-3 leading-relaxed whitespace-pre-wrap">{k.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

export default function DashboardKnowledge() {
    return (
        <Suspense fallback={<div className="p-10 opacity-50">Loading corpus...</div>}>
            <KnowledgeContent />
        </Suspense>
    );
}
