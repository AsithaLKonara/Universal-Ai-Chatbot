import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsService } from "@/lib/services/analytics";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function getToken(req: Request) {
    const auth = req.headers.get("authorization") || "";
    return auth.replace("Bearer ", "");
}

export async function GET(req: Request) {
    try {
        const payload = verifyToken(getToken(req)) as { id: string };
        
        // Find the user's primary project
        const project = await prisma.project.findFirst({
            where: { userId: payload.id },
            orderBy: { createdAt: "desc" },
        });

        if (!project) {
            return NextResponse.json({ error: "No project found" }, { status: 404 });
        }

        const stats = await AnalyticsService.getProjectStats(project.id);
        
        return NextResponse.json(stats);
    } catch (err) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
