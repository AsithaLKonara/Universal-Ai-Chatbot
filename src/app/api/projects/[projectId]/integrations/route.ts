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
        
        // Ensure user has access
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            const hasAccess = await prisma.projectMember.findFirst({
                where: { userId: payload.id, projectId: projectId }
            });
            const isOwner = await prisma.project.findFirst({ where: { id: projectId, userId: payload.id }});
            if (!hasAccess && !isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                whatsappEnabled: true,
                whatsappToken: true,
                whatsappPhoneId: true,
                whatsappVerifyToken: true,
                whatsappAppSecret: true,
                wooCommerceEnabled: true,
                wooCommerceStoreUrl: true,
                wooCommerceKey: true,
                wooCommerceSecret: true,
                twilioEnabled: true,
                twilioPhoneNumber: true,
                twilioAuthToken: true,
            }
        });

        return NextResponse.json(project);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const token = authHeader.split(" ")[1];
        const payload: any = verifyToken(token);
        
        // Ensure user is OWNER or ADMIN
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            const hasAccess = await prisma.projectMember.findFirst({
                where: { userId: payload.id, projectId: projectId, role: { in: ["OWNER", "ADMIN"] } }
            });
            const isOwner = await prisma.project.findFirst({ where: { id: projectId, userId: payload.id }});
            if (!hasAccess && !isOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const updates = await req.json();
        
        // Ensure we only update integration fields
        const allowedFields = [
            "whatsappEnabled", "whatsappToken", "whatsappPhoneId", "whatsappVerifyToken", "whatsappAppSecret",
            "wooCommerceEnabled", "wooCommerceStoreUrl", "wooCommerceKey", "wooCommerceSecret",
            "twilioEnabled", "twilioPhoneNumber", "twilioAuthToken"
        ];
        
        const safeUpdates: any = {};
        for (const key of allowedFields) {
            if (updates[key] !== undefined) safeUpdates[key] = updates[key];
        }

        const updatedProject = await prisma.project.update({
            where: { id: projectId },
            data: safeUpdates
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
