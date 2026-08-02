"use client";
import { useState, useEffect, Suspense } from "react";
import { FolderOpen, Plus, Trash2, Key, Check, Copy, ChevronRight, Globe, X, MessageSquare, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard, Project } from "@/components/dashboard/DashboardProvider";
import { CodeBlock } from "@/components/ui/code-block";
import { useRouter, useSearchParams } from "next/navigation";

function timeAgo(date: string) {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

function fmt(n: number) { return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n); }

function ProjectsContent() {
    const { projects, refreshData } = useDashboard();
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [creatingProject, setCreatingProject] = useState(false);
    
    useEffect(() => {
        if (searchParams.get("create") === "true") setShowCreate(true);
        const id = searchParams.get("id");
        if (id) {
            const p = projects.find(proj => proj.id === id);
            if (p) setSelectedProject(p);
        }
    }, [searchParams, projects]);

    const createProject = async () => {
        if (!newProjectName.trim()) return;
        setCreatingProject(true);
        try {
            const res = await fetch("/api/user/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
                body: JSON.stringify({ name: newProjectName }),
            });
            if (res.ok) {
                setNewProjectName("");
                setShowCreate(false);
                await refreshData();
            }
        } finally { setCreatingProject(false); }
    };

    const deleteProject = async (id: string) => {
        if (!confirm("Permanently destroy this module and all its data?")) return;
        await fetch(`/api/user/projects?id=${id}`, { 
            method: "DELETE", 
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
        });
        if (selectedProject?.id === id) setSelectedProject(null);
        await refreshData();
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tightest">Neural Nodes.</h1>
                        <p className="text-xs font-bold opacity-30 uppercase tracking-widest mt-1">Module Identity Management</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full font-black text-xs uppercase tracking-tighter"
                    >
                        <Plus size={14} /> New Module
                    </button>
                </div>

                <AnimatePresence>
                    {showCreate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-8 rounded-[40px] border border-accent/20 bg-accent/[0.03] flex flex-col md:flex-row gap-6 items-center">
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent border-b border-foreground/10 pb-2 text-xl font-black outline-none placeholder:opacity-20 uppercase tracking-tighter"
                                    placeholder="Identity Name..."
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && createProject()}
                                />
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={createProject}
                                        disabled={creatingProject || !newProjectName.trim()}
                                        className="flex-1 md:flex-none px-8 py-3 bg-foreground text-background rounded-2xl font-black text-xs uppercase tracking-tighter disabled:opacity-40"
                                    >
                                        {creatingProject ? "..." : "Authorize"}
                                    </button>
                                    <button onClick={() => setShowCreate(false)} className="p-3 bg-foreground/5 rounded-2xl opacity-40 hover:opacity-100">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-4">
                    {projects.map(p => (
                        <div key={p.id} className="space-y-3">
                            <div
                                className={`p-6 rounded-[32px] border transition-all flex items-center justify-between group ${
                                    selectedProject?.id === p.id ? "border-accent/40 bg-accent/[0.03]" : "border-foreground/10 hover:border-foreground/20 bg-foreground/[0.01]"
                                }`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${selectedProject?.id === p.id ? "bg-accent text-white" : "bg-foreground/5"}`}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-base font-black uppercase tracking-tighter">{p.name}</p>
                                        <div className="flex gap-4 items-center opacity-30 text-[10px] font-black uppercase tracking-widest mt-1">
                                            <span>{timeAgo(p.createdAt)}</span>
                                            <div className="w-1 h-1 rounded-full bg-current" />
                                            <span>{p.conversations} Signals</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => router.push(`/dashboard/knowledge?projectId=${p.id}`)}
                                        className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 transition-opacity px-4 py-2 bg-foreground/5 rounded-xl"
                                    >
                                        <BookOpen size={12} /> Knowledge
                                    </button>
                                    <button
                                        onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center bg-foreground/5 transition-transform ${selectedProject?.id === p.id ? "rotate-90 text-accent" : ""}`}
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedProject?.id === p.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                        className="p-8 rounded-[40px] border border-foreground/10 bg-foreground/[0.02] space-y-8"
                                    >
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-3 flex items-center gap-2"><Key size={12} /> Access Protocol</p>
                                                    <div className="group relative">
                                                        <div className="flex items-center gap-4 bg-foreground/5 rounded-2xl px-5 py-4 border border-foreground/5">
                                                            <code className="flex-1 text-xs font-bold opacity-60 truncate font-mono">{p.apiKey}</code>
                                                            <button onClick={() => {
                                                                navigator.clipboard.writeText(p.apiKey);
                                                                alert("API Key copied to clipboard");
                                                            }} className="hover:text-accent transition-colors">
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Integration Metrics</p>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 p-5 rounded-2xl bg-foreground/5 text-center">
                                                            <div className="text-xl font-black">{fmt(p.tokens)}</div>
                                                            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Processed</div>
                                                        </div>
                                                        <div className="flex-1 p-5 rounded-2xl bg-foreground/5 text-center">
                                                            <div className="text-xl font-black">{p.conversations}</div>
                                                            <div className="text-[9px] font-black uppercase tracking-widest opacity-30 mt-1">Successful</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30">Live Implementation</p>
                                                <CodeBlock lang="js" code={`fetch("/api/v1/chat", {\n  method: "POST",\n  headers: { "x-api-key": "${p.apiKey}" },\n  body: JSON.stringify({ messages: [] })\n})`} />
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-6 border-t border-foreground/5">
                                            <div className="flex gap-6">
                                                <button onClick={() => router.push(`/dashboard/conversations?projectId=${p.id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-accent transition-all">
                                                    <MessageSquare size={14} /> Full Logs
                                                </button>
                                                <button onClick={() => router.push(`/dashboard/knowledge?projectId=${p.id}`)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-accent transition-all">
                                                    <BookOpen size={14} /> Knowledge Node
                                                </button>
                                            </div>
                                            <button onClick={() => deleteProject(p.id)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-20 hover:opacity-100 hover:text-red-500 transition-all">
                                                <Trash2 size={14} /> Decommission
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}

export default function DashboardProjects() {
    return (
        <Suspense fallback={<div className="p-10 opacity-50">Loading modules...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
