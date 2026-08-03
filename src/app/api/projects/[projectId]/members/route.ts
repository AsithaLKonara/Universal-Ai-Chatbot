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
            if (!hasAccess) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const members = await prisma.projectMember.findMany({
            where: { projectId: projectId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        // Also fetch the owner
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        const allMembers = [
            { id: "owner_record", role: "OWNER", user: project?.user, joinedAt: project?.createdAt },
            ...members.map(m => ({ id: m.id, role: m.role, user: m.user, joinedAt: m.createdAt }))
        ];

        return NextResponse.json(allMembers);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ projectId: string }> }) {
    try {
        const { projectId } = await params;
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const token = authHeader.split(" ")[1];
        const payload: any = verifyToken(token);
        
        // Ensure user is OWNER or ADMIN of the project
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            const hasAccess = await prisma.projectMember.findFirst({
                where: { userId: payload.id, projectId: projectId, role: { in: ["OWNER", "ADMIN"] } }
            });
            const isProjectOwner = await prisma.project.findFirst({ where: { id: projectId, userId: payload.id }});
            if (!hasAccess && !isProjectOwner) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { email, role } = await req.json();
        
        // Find user by email
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return NextResponse.json({ error: "User not found. They must sign up first." }, { status: 404 });
        }

        const member = await prisma.projectMember.create({
            data: {
                userId: user.id,
                projectId: projectId,
                role
            },
            include: { user: { select: { id: true, name: true, email: true } } }
        });

        return NextResponse.json(member);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
