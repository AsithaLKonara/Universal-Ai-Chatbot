"use client";

import { useSearchParams } from "next/navigation";
import { ChatWidget } from "@/components/chat-widget";
import { Suspense } from "react";

function ChatEmbed() {
    const searchParams = useSearchParams();
    const projectId = searchParams.get("projectId");

    return (
        <div className="bg-transparent w-full h-full">
            <ChatWidget defaultOpen={true} projectId={projectId || undefined} />
        </div>
    );
}

export default function EmbedPage() {
    return (
        <Suspense>
            <ChatEmbed />
        </Suspense>
    );
}
