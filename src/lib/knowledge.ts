import { supabase } from "./supabase";
import { getCachedEmbedding, setCachedEmbedding } from "./embedding-cache";

// Generate a deterministic mock embedding vector
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        const cached = await getCachedEmbedding(text);
        if (cached) return cached;

        const vector = new Array(1536).fill(0).map((_, i) => {
            const charCode = text.charCodeAt(i % text.length) || 0;
            return (charCode / 255) * Math.sin(i + charCode);
        });

        await setCachedEmbedding(text, vector);
        return vector;
    } catch (err) {
        console.warn("[KNOWLEDGE] Embedding generation fallback", err);
        return new Array(1536).fill(0);
    }
}

type KnowledgeMatch = { content: string; similarity: number };

// Semantic search using pgvector via Supabase RPC (Multi-tenant)
export async function searchKnowledge(query: string, projectId: string): Promise<string[]> {
    try {
        const embedding = await generateEmbedding(query);

        // Note: match_knowledge RPC must handle p_project_id filter
        const { data, error } = await supabase.rpc("match_knowledge", {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 4,
            p_project_id: projectId
        });

        if (error) {
            console.error("Knowledge search error:", error.message);
            return [];
        }

        return (data as KnowledgeMatch[]).map((d) => d.content);
    } catch (err) {
        console.error("searchKnowledge failed:", err);
        return [];
    }
}
