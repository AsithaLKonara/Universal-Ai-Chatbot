import { prisma } from "@/lib/prisma";
import { comparePassword, signToken } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();
        const user = await prisma.user.findUnique({ 
            where: { email },
            include: { memberships: true }
        });
        if (!user || !(await comparePassword(password, user.password))) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const token = signToken({ 
            id: user.id, 
            role: user.role,
            memberships: user.memberships.map(m => ({ projectId: m.projectId, role: m.role }))
        });
        return NextResponse.json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                role: user.role,
                memberships: user.memberships
            } 
        });
    } catch (error) {
        return NextResponse.json({ error: "ERR" }, { status: 500 });
    }
}
