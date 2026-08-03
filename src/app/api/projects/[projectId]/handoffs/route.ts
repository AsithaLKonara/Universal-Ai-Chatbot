import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const token = authHeader.split(" ")[1];
        const payload: any = verifyToken(token);
        
        // Ensure user has access (Editor, Admin, Owner)
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            const hasAccess = await prisma.projectMember.findFirst({
                where: { userId: payload.id, projectId: projectId }
            });
            const isOwner = await prisma.project.findFirst({ where: { id: projectId, userId: payload.id }});
            if (!hasAccess && !isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const tickets = await prisma.handoffTicket.findMany({
            where: { projectId: projectId, status: { in: ["queued", "claimed"] } },
            orderBy: { createdAt: 'desc' }
        });

        // Also fetch the last message for each session to give context
        const populatedTickets = await Promise.all(tickets.map(async (t) => {
            const lastMsg = await prisma.conversation.findFirst({
                where: { projectId: projectId, sessionId: t.sessionId },
                orderBy: { createdAt: 'desc' }
            });
            return {
                ...t,
                lastMessage: lastMsg?.message || "User requested human agent.",
                preview: lastMsg?.message || "User requested human agent."
            };
        }));

        return NextResponse.json(populatedTickets);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
