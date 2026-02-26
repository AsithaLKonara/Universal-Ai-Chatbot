"use client";
import { useState } from "react";
import { Copy, Terminal, Check, Command } from "lucide-react";
import { NanoCard } from "@/components/ui-nano";

export default function DocsPage() {
    const [copied, setCopied] = useState(false);
    const copyCode = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); };

    const samples = {
        curl: `curl -X POST https://api.omnichat.ai/v1/chat \\
  -H "x-api-key: <KEY>" \\
  -d '{"messages": [{"role": "user", "content": "Query"}]}'`
    };

    return (
        <div className="min-h-screen bg-background text-foreground font-sans p-10 max-w-7xl mx-auto">
            <header className="mb-32">
                <div className="w-12 h-12 bg-foreground text-background rounded-full flex items-center justify-center font-black mb-10"><Command size={24} /></div>
                <h1 className="text-7xl font-black tracking-tightest leading-none mb-6">PROTOCOLS.</h1>
                <p className="text-xl opacity-40 font-medium max-w-xl uppercase tracking-tighter">System integration and interface specifications.</p>
            </header>

            <div className="grid md:grid-cols-[1fr_400px] gap-20">
                <div className="space-y-32">
                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-30 mb-10">01 / Authentication</h2>
                        <div className="space-y-6">
                            <p className="text-lg font-medium leading-relaxed opacity-70">Requests must authenticate via the <code className="bg-border px-2 py-1 rounded">x-api-key</code> header. Unauthorized entities will be rejected with 401 status.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-black uppercase tracking-[0.2em] opacity-30 mb-10">02 / Completion</h2>
                        <div className="space-y-8">
                            <div className="flex items-center gap-4 bg-accent/10 border border-accent/20 p-4 rounded-2xl w-fit">
                                <span className="text-[10px] font-black uppercase tracking-widest text-accent">Post</span>
                                <span className="text-[10px] font-bold opacity-60">/v1/chat</span>
                            </div>
                            <p className="text-lg font-medium leading-relaxed opacity-70">Generates autonomous responses based on the neural knowledge index of the specific project module.</p>
                            <NanoCard className="p-0 border-none overflow-hidden">
                                <div className="bg-border/50 p-4 flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Schema</span>
                                </div>
                                <div className="p-6 space-y-4">
                                    {["messages (array)", "userId (string)"].map(item => (
                                        <div key={item} className="flex justify-between border-b border-border pb-2">
                                            <span className="text-xs font-black uppercase tracking-tighter">{item.split(" ")[0]}</span>
                                            <span className="text-[10px] opacity-40 italic">{item.split(" ")[1]}</span>
                                        </div>
                                    ))}
                                </div>
                            </NanoCard>
                        </div>
                    </section>
                </div>

                <aside className="sticky top-10 flex flex-col gap-6">
                    <div className="bg-foreground text-background rounded-[40px] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4">
                            <button onClick={() => copyCode(samples.curl)} className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition-all">
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-30 mb-8 flex items-center gap-2">
                            <Terminal size={12} /> Interaction Terminal
                        </h4>
                        <pre className="text-xs font-bold leading-relaxed overflow-x-auto selection:bg-white selection:text-black">
                            {samples.curl}
                        </pre>
                    </div>

                    <NanoCard className="border-accent/30 bg-accent/5">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-2 text-accent">Neural SDK</h4>
                        <p className="text-xs font-bold opacity-50 mb-6 leading-relaxed">Direct Shadow DOM injection for web environments.</p>
                        <button className="w-full py-4 bg-accent text-white rounded-2xl text-[10px] font-black uppercase tracking-widest">Acquire Module</button>
                    </NanoCard>
                </aside>
            </div>
        </div>
    );
}
