import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        
        const token = authHeader.split(" ")[1];
        const payload: any = verifyToken(token);
        
        // Ensure user is ADMIN or OWNER globally
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const projects = await prisma.project.findMany({
            include: {
                user: { select: { id: true, name: true, email: true } },
                _count: {
                    select: {
                        conversations: true,
                        customers: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const formattedTenants = projects.map(p => ({
            id: p.id,
            name: p.name,
            owner: p.user?.name || p.user?.email || "Unknown",
            status: "Active", // simplified status
            plan: "Pro",      // simplified plan
            users: p._count.customers,
            tokens: p._count.conversations * 150 // Mocking tokens based on conversations
        }));

        return NextResponse.json(formattedTenants);
    } catch (err) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
