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
            } else {
                const data = await res.json().catch(() => null);
                alert(data?.error || "Failed to authorize module.");
            }
        } catch (e: any) {
            alert(e.message || "Network error. Failed to authorize module.");
        } finally { setCreatingProject(false); }
    };

    const deleteProject = async (id: string) => {
        if (!confirm("Permanently destroy this module and all its data?")) return;
        try {
            const res = await fetch(`/api/user/projects?id=${id}`, { 
                method: "DELETE", 
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } 
            });
            if (!res.ok) throw new Error("Failed to decommission module.");
            if (selectedProject?.id === id) setSelectedProject(null);
            await refreshData();
        } catch (e: any) {
            alert(e.message || "Network error. Failed to decommission.");
        }
    };

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-10">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-display font-bold tracking-tight text-primary">Projects.</h1>
                        <p className="text-[13px] font-mono text-tertiary uppercase tracking-widest mt-1">Workspace Nodes</p>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-accent text-base rounded-[12px] font-semibold text-[13px] hover:brightness-110 transition-all shadow-[0_0_20px_rgba(0,212,216,0.2)]"
                    >
                        <Plus size={16} /> New Project
                    </button>
                </div>

                <AnimatePresence>
                    {showCreate && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="p-8 rounded-[24px] border border-accent/20 bg-accent/5 flex flex-col md:flex-row gap-6 items-center mb-6">
                                <input
                                    autoFocus
                                    className="flex-1 bg-transparent border-b border-border-subtle focus:border-accent pb-2 text-xl font-display font-medium text-primary outline-none placeholder:text-tertiary transition-colors"
                                    placeholder="Project Name..."
                                    value={newProjectName}
                                    onChange={e => setNewProjectName(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && createProject()}
                                />
                                <div className="flex gap-3 w-full md:w-auto">
                                    <button
                                        onClick={createProject}
                                        disabled={creatingProject || !newProjectName.trim()}
                                        className="flex-1 md:flex-none px-6 py-2.5 bg-accent text-base rounded-[12px] font-semibold text-[13px] disabled:opacity-40"
                                    >
                                        {creatingProject ? "Creating..." : "Create"}
                                    </button>
                                    <button onClick={() => setShowCreate(false)} className="p-2.5 bg-overlay text-secondary rounded-[12px] hover:text-primary transition-colors">
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
                                className={`p-6 rounded-[24px] bg-raised border transition-all flex items-center justify-between group cursor-pointer ${
                                    selectedProject?.id === p.id ? "border-accent/40 shadow-[0_0_30px_-10px_rgba(0,212,216,0.15)]" : "border-border-subtle hover:border-accent/20 hover:shadow-lg"
                                }`}
                                onClick={() => setSelectedProject(selectedProject?.id === p.id ? null : p)}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`w-12 h-12 rounded-[12px] flex items-center justify-center transition-colors border ${selectedProject?.id === p.id ? "bg-accent/10 border-accent/20 text-accent" : "bg-overlay border-border-subtle text-secondary group-hover:text-accent group-hover:border-accent/20"}`}>
                                        <Globe size={20} />
                                    </div>
                                    <div>
                                        <p className="text-[16px] font-display font-semibold text-primary">{p.name}</p>
                                        <div className="flex gap-3 items-center text-[12px] text-tertiary font-mono mt-1">
                                            <span>{timeAgo(p.createdAt)}</span>
                                            <div className="w-1 h-1 rounded-full bg-border-strong" />
                                            <span>{p.conversations} Logs</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/knowledge?projectId=${p.id}`); }}
                                        className="hidden md:flex items-center gap-2 text-[12px] font-mono uppercase tracking-wider text-secondary hover:text-accent transition-colors px-4 py-2 bg-overlay rounded-[8px] border border-border-subtle hover:border-accent/30"
                                    >
                                        <BookOpen size={14} /> Knowledge
                                    </button>
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform ${selectedProject?.id === p.id ? "rotate-90 text-accent" : "text-tertiary group-hover:text-accent"}`}
                                    >
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {selectedProject?.id === p.id && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }}
                                        className="p-8 rounded-[24px] bg-raised border border-border-subtle mt-4 space-y-8"
                                    >
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-[11px] font-mono uppercase tracking-widest text-tertiary mb-3 flex items-center gap-2"><Key size={14} /> Access Protocol</p>
                                                    <div className="group relative">
                                                        <div className="flex items-center gap-4 bg-overlay rounded-[12px] px-4 py-3 border border-border-subtle">
                                                            <code className="flex-1 text-[13px] text-secondary truncate font-mono">{p.apiKey}</code>
                                                            <button onClick={() => {
                                                                navigator.clipboard.writeText(p.apiKey);
                                                                alert("API Key copied to clipboard");
                                                            }} className="text-tertiary hover:text-accent transition-colors">
                                                                <Copy size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-[11px] font-mono uppercase tracking-widest text-tertiary">Integration Metrics</p>
                                                    <div className="flex gap-4">
                                                        <div className="flex-1 p-4 rounded-[16px] bg-overlay border border-border-subtle text-center">
                                                            <div className="text-2xl font-display font-semibold text-primary">{fmt(p.tokens)}</div>
                                                            <div className="text-[11px] font-mono text-tertiary uppercase tracking-widest mt-1">Processed</div>
                                                        </div>
                                                        <div className="flex-1 p-4 rounded-[16px] bg-overlay border border-border-subtle text-center">
                                                            <div className="text-2xl font-display font-semibold text-primary">{p.conversations}</div>
                                                            <div className="text-[11px] font-mono text-tertiary uppercase tracking-widest mt-1">Successful</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <p className="text-[11px] font-mono uppercase tracking-widest text-tertiary">Live Implementation</p>
                                                <div className="rounded-[16px] overflow-hidden border border-border-subtle">
                                                    <CodeBlock lang="js" code={`fetch("/api/v1/chat", {\n  method: "POST",\n  headers: { "x-api-key": "${p.apiKey}" },\n  body: JSON.stringify({ messages: [] })\n})`} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-6 border-t border-border-subtle">
                                            <div className="flex gap-6">
                                                <button onClick={() => router.push(`/dashboard/conversations?projectId=${p.id}`)} className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-secondary hover:text-accent transition-colors">
                                                    <MessageSquare size={14} /> Full Logs
                                                </button>
                                                <button onClick={() => router.push(`/dashboard/knowledge?projectId=${p.id}`)} className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-secondary hover:text-accent transition-colors">
                                                    <BookOpen size={14} /> Knowledge Node
                                                </button>
                                            </div>
                                            <button onClick={() => deleteProject(p.id)} className="flex items-center gap-2 text-[12px] font-mono uppercase tracking-widest text-tertiary hover:text-error transition-colors">
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
