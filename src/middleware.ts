import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_neural_link");

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Public routes
    if (
        pathname === "/" || 
        pathname.startsWith("/login") || 
        pathname.startsWith("/register") || 
        pathname.startsWith("/forgot-password") || 
        pathname.startsWith("/verify") ||
        pathname.startsWith("/api/auth") ||
        pathname.startsWith("/api/webhooks") ||
        pathname.includes(".") // static files
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token")?.value || request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(token, SECRET);
        
        // Super Admin only routes
        if (pathname.startsWith("/dashboard/admin") && payload.role !== "ADMIN" && payload.role !== "OWNER") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        // If they hit the root dashboard, redirect to their specific view based on role
        if (pathname === "/dashboard") {
            if (payload.role === "ADMIN" || payload.role === "OWNER") {
                return NextResponse.redirect(new URL("/dashboard/admin/tenants", request.url));
            }
            
            const memberships = payload.memberships as Array<{ projectId: string; role: string }> | undefined;
            if (memberships && memberships.length > 0) {
                // If they are only an EDITOR, route them to inbox
                const primaryRole = memberships[0].role;
                if (primaryRole === "EDITOR") {
                    return NextResponse.redirect(new URL("/dashboard/inbox", request.url));
                }
            }
        }

        const response = NextResponse.next();
        return response;
    } catch (e) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
