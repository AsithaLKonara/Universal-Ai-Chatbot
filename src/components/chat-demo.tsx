"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Command, User } from "lucide-react";

export type Message = {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
};

const defaultConversation: Message[] = [
    { id: "1", role: "user", content: "Can you check if order #4092 is ready for shipping?", timestamp: "10:42 AM" },
    { id: "2", role: "assistant", content: "Let me check that for you. Order #4092 is packed and waiting for carrier pickup today at 3:00 PM.", timestamp: "10:42 AM" },
    { id: "3", role: "user", content: "Great. Can you automatically email the customer the tracking link once it's picked up?", timestamp: "10:43 AM" },
    { id: "4", role: "assistant", content: "Done. I've set up a trigger to send the tracking email via Postmark as soon as the carrier scans the package.", timestamp: "10:43 AM" },
];

export const TypingIndicator = () => (
    <div className="flex items-center gap-1.5 px-2 py-1 h-6">
        {[0, 1, 2].map((dot) => (
            <motion.div
                key={dot}
                className="w-1.5 h-1.5 bg-secondary rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: dot * 0.2,
                    ease: "easeInOut"
                }}
            />
        ))}
    </div>
);

export const ChatMessage = ({ message, isStatic = false }: { message: Message; isStatic?: boolean }) => {
    const isUser = message.role === "user";

    const content = (
        <div className={`flex w-full gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-[8px] flex items-center justify-center ${
                isUser ? "bg-overlay text-secondary border border-border-subtle" : "bg-primary text-base"
            }`}>
                {isUser ? <User size={16} /> : <Command size={16} />}
            </div>
            
            <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 text-[14px] leading-[1.5] ${
                    isUser 
                    ? "bg-overlay border border-border-subtle text-primary rounded-[16px] rounded-tr-[4px]" 
                    : "bg-base border border-border-subtle text-primary rounded-[16px] rounded-tl-[4px]"
                }`}>
                    {message.content}
                </div>
                {message.timestamp && (
                    <span className="text-[11px] font-mono text-tertiary px-1">
                        {message.timestamp}
                    </span>
                )}
            </div>
        </div>
    );

    if (isStatic) return <div className="w-full">{content}</div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
        >
            {content}
        </motion.div>
    );
};

export const ChatDemo = ({ 
    conversation = defaultConversation, 
    isStatic = false,
    className = ""
}: { 
    conversation?: Message[];
    isStatic?: boolean;
    className?: string;
}) => {
    const [visibleMessages, setVisibleMessages] = useState<Message[]>(isStatic ? conversation : []);
    const [isTyping, setIsTyping] = useState(!isStatic);

    useEffect(() => {
        if (isStatic) return;
        
        let mounted = true;
        
        const playConversation = async () => {
            for (let i = 0; i < conversation.length; i++) {
                if (!mounted) return;
                
                const msg = conversation[i];
                
                if (msg.role === "assistant") {
                    setIsTyping(true);
                    // Simulate typing delay based on message length (min 600ms, max 2000ms)
                    const typingTime = Math.min(Math.max(msg.content.length * 30, 600), 2000);
                    await new Promise(r => setTimeout(r, typingTime));
                    if (!mounted) return;
                    setIsTyping(false);
                } else {
                    // Small pause before user sends message
                    await new Promise(r => setTimeout(r, 600));
                }
                
                if (!mounted) return;
                setVisibleMessages(prev => [...prev, msg]);
            }
        };

        playConversation();

        return () => { mounted = false; };
    }, [conversation, isStatic]);

    return (
        <div className={`w-full max-w-2xl mx-auto bg-raised border border-border-subtle rounded-[16px] overflow-hidden shadow-2xl ${className}`}>
            {/* Header */}
            <div className="h-12 border-b border-border-subtle bg-base/50 flex items-center px-4 gap-3">
                <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-border-strong" />
                    <div className="w-3 h-3 rounded-full bg-border-strong" />
                    <div className="w-3 h-3 rounded-full bg-border-strong" />
                </div>
                <div className="text-[13px] font-mono font-medium text-secondary mx-auto pr-10">
                    agent-session-4092
                </div>
            </div>

            {/* Chat Body */}
            <div className="p-6 flex flex-col gap-6 min-h-[300px]">
                {visibleMessages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} isStatic={isStatic} />
                ))}
                
                {isTyping && !isStatic && (
                    <motion.div 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex gap-4 w-full"
                    >
                        <div className="flex-shrink-0 w-8 h-8 bg-primary text-base rounded-[8px] flex items-center justify-center">
                            <Command size={16} />
                        </div>
                        <div className="bg-base border border-border-subtle rounded-[16px] rounded-tl-[4px] px-4 py-3">
                            <TypingIndicator />
                        </div>
                    </motion.div>
                )}
            </div>
            
            {/* Input area */}
            <div className="p-4 border-t border-border-subtle bg-base">
                <div className="w-full bg-overlay border border-border-subtle rounded-[8px] px-4 py-3 flex items-center justify-between opacity-50">
                    <span className="text-[14px] text-tertiary">Waiting for response...</span>
                    <Command size={16} className="text-tertiary" />
                </div>
            </div>
        </div>
    );
};
