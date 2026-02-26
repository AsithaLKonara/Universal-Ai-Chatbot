import { supabase } from "./supabase";

export async function saveMessage(projectId: string, userId: string, message: string, response: string) {
    await supabase.from("conversations").insert({
        project_id: projectId,
        user_id: userId,
        message,
        response,
    });
}

export async function getHistory(projectId: string, userId: string) {
    const { data } = await supabase
        .from("conversations")
        .select("message, response")
        .eq("project_id", projectId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(3);

    return data || [];
}
