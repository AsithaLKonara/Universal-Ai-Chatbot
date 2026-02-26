import { groq } from "@/lib/groq";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "You are a helpful assistant. Use context if provided. Be concise." },
                ...messages.slice(-3),
            ],
            max_completion_tokens: 200,
        });

        return NextResponse.json({ content: response.choices[0].message.content });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch AI response" }, { status: 500 });
    }
}
