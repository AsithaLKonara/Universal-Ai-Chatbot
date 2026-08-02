import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/prisma";
import { ProjectRole } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_dev";

/**
 * Enterprise SSO Provisioning (JIT)
 * This endpoint intercepts SSO callbacks (e.g., SAML assertion, OIDC token).
 * It automatically maps the user to their company's project based on their email domain.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, name, ssoProviderId } = body;

        if (!email || !ssoProviderId) {
            return NextResponse.json({ error: "Missing SSO payload" }, { status: 400 });
        }

        const domain = email.split("@")[1];
        if (!domain) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // 1. Locate the Enterprise Project by SSO Domain
        const project = await prisma.project.findFirst({
            where: { ssoDomain: domain }
        });

        if (!project) {
            return NextResponse.json({ error: `No enterprise workspace configured for domain: ${domain}` }, { status: 403 });
        }

        // 2. Just-In-Time Provisioning: Create User if they don't exist
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            const randomPassword = await bcrypt.hash(crypto.randomUUID(), 10);
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    password: randomPassword, // Auto-generated for SSO users
                    plan: "ENTERPRISE",
                    emailVerified: new Date()
                }
            });
        }

        // 3. RBAC Mapping: Add them to the Project as a VIEWER if not already a member
        const membership = await prisma.projectMember.findUnique({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: project.id
                }
            }
        });

        if (!membership) {
            await prisma.projectMember.create({
                data: {
                    userId: user.id,
                    projectId: project.id,
                    role: ProjectRole.VIEWER // Least Privilege Principle
                }
            });
        }

        // 4. Issue Session JWT
        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        
        const response = NextResponse.json({ 
            message: "SSO Provisioning Successful", 
            projectId: project.id,
            role: membership ? membership.role : ProjectRole.VIEWER
        });
        
        response.cookies.set("auth-token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });

        return response;

    } catch (error) {
        console.error("[SSO] Provisioning Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
