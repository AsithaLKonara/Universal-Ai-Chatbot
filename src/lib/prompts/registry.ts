export type PromptVersion = string;

export interface PromptRegistry {
    [key: string]: {
        [version: PromptVersion]: string;
        latest: PromptVersion;
    };
}

const REGISTRY: PromptRegistry = {
    "intent_classifier": {
        "1.0.0": "You are an intent classifier for a premium AI commerce agent...",
        "1.1.0": "You are a specialized intent classifier for OmniChat...",
        "latest": "1.1.0"
    },
    "sales_agent": {
        "1.0.0": "You are a professional sales consultant...",
        "latest": "1.0.0"
    }
};

export function getPrompt(name: string, version?: PromptVersion): string {
    const promptSet = REGISTRY[name];
    if (!promptSet) return "";

    const v = version || promptSet.latest;
    return promptSet[v] || promptSet[promptSet.latest];
}
