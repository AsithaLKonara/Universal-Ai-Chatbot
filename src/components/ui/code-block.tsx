"use client";
import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CodeBlock({ code, lang = "bash" }: { code: string; lang?: string }) {
    const [copied, setCopied] = useState(false);
    
    const copy = () => { 
        navigator.clipboard.writeText(code); 
        setCopied(true); 
        setTimeout(() => setCopied(false), 2000); 
    };

    return (
        <div className="relative rounded-2xl bg-foreground text-background overflow-hidden text-xs font-mono">
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 opacity-40">
                <span className="uppercase text-[10px] tracking-widest">{lang}</span>
                <button onClick={copy} className="p-1 hover:opacity-100 opacity-60 transition-opacity">
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
            </div>
            <pre className="p-4 overflow-x-auto leading-relaxed whitespace-pre-wrap">{code}</pre>
        </div>
    );
}
