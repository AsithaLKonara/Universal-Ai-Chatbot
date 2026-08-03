import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string; id: string }> }) {
    try {
        const { projectId, id } = await params;
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const token = authHeader.split(" ")[1];
        const payload: any = verifyToken(token);
        
        // Ensure user has access
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            const hasAccess = await prisma.projectMember.findFirst({
                where: { userId: payload.id, projectId: projectId }
            });
            const isOwner = await prisma.project.findFirst({ where: { id: projectId, userId: payload.id }});
            if (!hasAccess && !isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { status } = await req.json();
        
        if (!["queued", "claimed", "resolved"].includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        const updatedTicket = await prisma.handoffTicket.update({
            where: { id: id },
            data: { 
                status,
                claimedBy: status === "claimed" ? payload.id : undefined
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
