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
        
        // RBAC logic example
        if (pathname.startsWith("/admin") && payload.role !== "ADMIN" && payload.role !== "OWNER") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
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
