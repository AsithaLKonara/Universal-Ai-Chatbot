import { CheckoutStage } from "../../checkout";

export type Channel = "web" | "whatsapp" | "api" | "voice";

export interface OrchestratorContext {
    projectId: string;
    userId: string;
    sessionId: string;
    channel: Channel;
    message: string;
    metadata?: Record<string, any>;
    onStream?: (chunk: string) => void;
}

export interface ConversationContext {
    profile: any;
    history: any[];
    cart: any;
    checkout: any;
    knowledge: string[];
    project: any;
}

export interface OrchestratorResponse {
    content: string;
    data?: any;
    intent: string;
    metadata?: Record<string, any>;
}
