import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_neural_link");

export async function GET(req: Request) {
    try {
        const token = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("token="))?.split("=")[1];
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { payload } = await jwtVerify(token, SECRET);
        if (payload.role !== "ADMIN" && payload.role !== "OWNER") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const usersCount = await prisma.user.count();
        const nodesCount = await prisma.project.count();
        
        const usageAgg = await prisma.usage.aggregate({
            _sum: { tokens: true }
        });
        const tokensCount = usageAgg._sum.tokens || 0;

        const recentUsersData = await prisma.user.findMany({
            take: 5,
            orderBy: { createdAt: "desc" },
            select: { id: true, email: true, plan: true }
        });

        const recentUsers = recentUsersData.map(u => ({
            id: u.id,
            email: u.email,
            plan: u.plan,
            saturation: Math.floor(Math.random() * 100) // Mock saturation for now
        }));

        return NextResponse.json({
            users: usersCount,
            tokens: tokensCount,
            revenue: usersCount * 29, // Mock calculation
            nodes: nodesCount,
            recentUsers
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
