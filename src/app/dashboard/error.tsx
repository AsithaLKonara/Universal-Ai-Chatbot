"use client";

import { useEffect } from "react";
import { AlertCircle } from "lucide-react";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center space-y-6 text-red-400">
            <AlertCircle size={48} className="opacity-50" />
            <div className="text-center">
                <h2 className="text-xl font-black uppercase tracking-tightest mb-2">Module Error</h2>
                <p className="text-xs font-medium uppercase tracking-widest opacity-60 max-w-sm">
                    {error.message || "An unexpected error occurred in this module."}
                </p>
            </div>
            <button
                onClick={reset}
                className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-full text-[10px] font-black uppercase tracking-widest transition-colors"
            >
                Retry
            </button>
        </div>
    );
}
