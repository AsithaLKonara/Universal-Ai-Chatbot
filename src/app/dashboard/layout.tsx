"use client";
import { LayoutDashboard, FolderOpen, BookOpen, MessageSquare, Key, Command, LogOut, AlertCircle, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardProvider";

const NAV = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
    { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
    { href: "/dashboard/knowledge", icon: BookOpen, label: "Knowledge" },
    { href: "/dashboard/conversations", icon: MessageSquare, label: "Logs" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/docs", icon: Key, label: "API Docs" },
];

function DashboardSidebar() {
    const pathname = usePathname();
    const { data, logout } = useDashboard();

    return (
        <aside className="w-16 md:w-60 border-r border-foreground/10 flex flex-col py-6 px-3 md:px-5 gap-2 sticky top-0 h-screen overflow-y-auto overflow-x-hidden">
            <div className="flex items-center gap-3 mb-8 px-1">
                <div className="w-8 h-8 bg-foreground text-background rounded-xl flex items-center justify-center flex-shrink-0">
                    <Command size={16} />
                </div>
                <span className="hidden md:block text-sm font-black tracking-tighter uppercase">OmniChat AI</span>
            </div>
            
            <nav className="flex-1 space-y-1">
                {NAV.map(item => {
                    const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-left ${
                                isActive
                                    ? "bg-foreground text-background"
                                    : "opacity-40 hover:opacity-80 hover:bg-foreground/5"
                            }`}
                        >
                            <item.icon size={18} className="flex-shrink-0" />
                            <span className="hidden md:block text-xs font-black uppercase tracking-tight">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {data && (
                <div className="border-t border-foreground/10 pt-4 mt-2 space-y-3">
                    <div className="hidden md:block px-3 py-2">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-30 mb-1">Authenticated</p>
                        <p className="text-xs font-bold truncate opacity-70">{data.user.email}</p>
                        <span className="inline-block mt-1 text-[9px] font-black uppercase tracking-widest bg-accent/10 text-accent px-2 py-0.5 rounded-full">{data.user.plan}</span>
                    </div>
                    <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl opacity-30 hover:opacity-100 hover:text-red-500 transition-all">
                        <LogOut size={18} className="flex-shrink-0" />
                        <span className="hidden md:block text-xs font-black uppercase tracking-tight">System Out</span>
                    </button>
                </div>
            )}
        </aside>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { loading, error } = useDashboard();

    if (loading) return (
        <div className="min-h-screen bg-background flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 opacity-30">
                <div className="w-10 h-10 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                <p className="text-xs font-black uppercase tracking-widest">Initializing Module...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-background flex-1 flex items-center justify-center gap-4 text-red-400">
            <AlertCircle size={32} />
            <p className="font-black text-sm uppercase tracking-widest">{error}</p>
        </div>
    );

    return (
        <main className="flex-1 overflow-auto">
            {children}
        </main>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <div className="min-h-screen bg-background flex text-foreground" style={{ fontFamily: "var(--font-sans)" }}>
                <DashboardSidebar />
                <DashboardContent>{children}</DashboardContent>
            </div>
        </DashboardProvider>
    );
}
