"use client";
import { useState, useEffect } from "react";
import { NanoCard, H2} from "@/components/ui-nano";
import { Send, User, Bot, AlertCircle, CheckCircle2, Clock, Search, GripVertical, Inbox, Hand } from "lucide-react";
import { useDashboard } from "@/components/dashboard/DashboardProvider";

export default function InboxPage() {
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const { projects } = useDashboard();
    const projectId = projects?.[0]?.id;
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchQueue = async () => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/handoffs`, {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (res.ok) {
                const data = await res.json();
                setQueue(data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // SWR-like polling every 5s
        return () => clearInterval(interval);
    }, [projectId]);

    const handleClaim = async (ticketId: string) => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/handoffs/${ticketId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({ status: "claimed" })
            });
            if (res.ok) fetchQueue();
        } catch (e) {
            console.error(e);
        }
    };

    const handleResolve = async (ticketId: string) => {
        if (!projectId) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/handoffs/${ticketId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                },
                body: JSON.stringify({ status: "resolved" })
            });
            if (res.ok) {
                if (selectedChatId === ticketId) setSelectedChatId(null);
                fetchQueue();
            }
        } catch (e) {
            console.error(e);
        }
    };

    const selectedChat = queue.find(q => q.id === selectedChatId);

    // Mock messages for now since fetching real messages needs a messages API
    const messages = [
        { id: 1, sender: "user", text: selectedChat?.preview || "Hi, I need help." },
        { id: 2, sender: "system", text: "Conversation escalated to human agent." }
    ];

    return (
        <div className="h-[calc(100vh-64px)] flex bg-base">
            {/* Left Sidebar: Queue */}
            <div className="w-80 border-r border-border-subtle bg-raised flex flex-col">
                <div className="p-6 border-b border-border-subtle">
                    <H2 className="text-primary mb-2 text-xl">Inbox</H2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary" size={14} />
                        <input type="text" placeholder="Search queue..." className="w-full bg-base border border-border-subtle rounded-full pl-9 pr-4 py-2 text-[13px] text-primary focus:outline-none focus:border-accent" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading && queue.length === 0 && <div className="p-6 text-tertiary text-sm">Loading queue...</div>}
                    {!loading && queue.length === 0 && <div className="p-6 text-tertiary text-sm">Queue is empty.</div>}
                    {queue.map(chat => (
                        <div 
                            key={chat.id} 
                            onClick={() => setSelectedChatId(chat.id)}
                            className={`p-4 border-b border-border-subtle cursor-pointer transition-colors ${selectedChatId === chat.id ? 'bg-overlay border-l-2 border-l-accent' : 'hover:bg-overlay/50 border-l-2 border-l-transparent'}`}
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[13px] font-semibold text-primary">{chat.customerName || chat.sessionId.slice(0, 8)}</span>
                                <span className="text-[10px] font-mono text-tertiary uppercase tracking-widest">
                                    {Math.floor((Date.now() - new Date(chat.createdAt).getTime()) / 60000)}m
                                </span>
                            </div>
                            <p className="text-[12px] text-secondary truncate">{chat.preview}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <span className={`w-2 h-2 rounded-full ${chat.status === 'queued' ? 'bg-state-warning animate-pulse' : 'bg-state-success'}`} />
                                <span className="text-[10px] font-mono text-tertiary uppercase tracking-widest">{chat.status}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Pane: Active Chat */}
            <div className="flex-1 flex flex-col bg-base relative">
                {selectedChat ? (
                    <>
                        <div className="h-16 border-b border-border-subtle px-6 flex items-center justify-between bg-raised">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-overlay flex items-center justify-center text-secondary border border-border-subtle">
                                    <User size={16} />
                                </div>
                                <div>
                                    <div className="text-[14px] font-semibold text-primary">{selectedChat.customerName || selectedChat.sessionId.slice(0,8)}</div>
                                    <div className="text-[11px] font-mono text-tertiary uppercase tracking-widest flex items-center gap-1">
                                        <div className={`w-1.5 h-1.5 rounded-full ${selectedChat.status === 'claimed' ? 'bg-state-success' : 'bg-state-warning'}`} /> 
                                        {selectedChat.status === 'claimed' ? 'Handoff Active' : 'Waiting for Agent'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {selectedChat.status === 'queued' && (
                                    <button onClick={() => handleClaim(selectedChat.id)} className="flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 px-4 py-2 rounded-[8px] text-[12px] font-semibold hover:bg-accent/20 transition-colors">
                                        <Hand size={14} /> Claim Ticket
                                    </button>
                                )}
                                <button onClick={() => handleResolve(selectedChat.id)} className="flex items-center gap-2 bg-overlay text-primary border border-border-subtle px-4 py-2 rounded-[8px] text-[12px] font-semibold hover:border-accent/50 transition-colors">
                                    <CheckCircle2 size={14} className="text-state-success" /> Resolve & Return to AI
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : msg.sender === 'system' ? 'justify-center' : 'justify-start'}`}>
                                    {msg.sender === 'system' ? (
                                        <div className="bg-overlay border border-border-subtle px-4 py-1.5 rounded-full text-[10px] font-mono uppercase tracking-widest text-tertiary flex items-center gap-2">
                                            <AlertCircle size={12} className="text-state-warning" /> {msg.text}
                                        </div>
                                    ) : (
                                        <div className={`max-w-[70%] flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className="w-8 h-8 shrink-0 rounded-full bg-raised flex items-center justify-center border border-border-subtle mt-1 text-tertiary">
                                                {msg.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                                            </div>
                                            <div className={`p-4 rounded-[16px] text-[13px] leading-relaxed ${msg.sender === 'user' ? 'bg-primary text-base rounded-tr-none' : 'bg-raised border border-border-subtle text-secondary rounded-tl-none'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-raised border-t border-border-subtle">
                            <div className="flex items-center gap-3 bg-base border border-border-subtle rounded-[16px] p-2 focus-within:border-accent transition-colors">
                                <button className="p-2 text-tertiary hover:text-primary">
                                    <GripVertical size={18} />
                                </button>
                                <input type="text" placeholder="Type your message as a human agent..." className="flex-1 bg-transparent text-[14px] text-primary focus:outline-none" />
                                <button className="w-10 h-10 rounded-[12px] bg-primary text-base flex items-center justify-center hover:opacity-90">
                                    <Send size={16} />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-tertiary">
                        <Inbox size={48} className="mb-4 opacity-20" />
                        <h3 className="text-xl font-display font-semibold text-primary mb-2">Inbox Zero</h3>
                        <p className="text-[14px]">No active handoff requests. You&apos;re all caught up.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
