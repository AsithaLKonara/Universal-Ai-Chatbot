"use client";
import { LayoutDashboard, FolderOpen, BookOpen, MessageSquare, Command, LogOut, AlertCircle, BarChart3, Search, ChevronRight, Settings, Users, Activity, Inbox, Plug } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardProvider";

const NAV_TENANT = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
    { href: "/dashboard/inbox", icon: Inbox, label: "Inbox" },
    { href: "/dashboard/projects", icon: FolderOpen, label: "Projects" },
    { href: "/dashboard/knowledge", icon: BookOpen, label: "Knowledge" },
    { href: "/dashboard/conversations", icon: MessageSquare, label: "Logs" },
    { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
    { href: "/dashboard/integrations", icon: Plug, label: "Integrations" },
    { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

const NAV_ADMIN = [
    { href: "/dashboard/admin/tenants", icon: Users, label: "Tenants" },
    { href: "/dashboard/admin/health", icon: Activity, label: "System Health" },
];

function DashboardSidebar() {
    const pathname = usePathname();
    const { data, projects, logout } = useDashboard();
    const isAdmin = data?.user?.role === "admin";
    
    // Assume active project is the first one for now (matching useDashboard usage elsewhere)
    const activeProject = projects?.[0];
    const projectRole = activeProject?.projectRole || "VIEWER";
    
    const isSupportAgent = projectRole === "EDITOR";
    const isViewer = projectRole === "VIEWER";

    // Filter Navigation based on Role
    const filteredNavTenant = NAV_TENANT.filter(item => {
        if (isSupportAgent) {
            // Support Agents only see Inbox, Knowledge, and Logs
            return ["/dashboard/inbox", "/dashboard/knowledge", "/dashboard/conversations"].includes(item.href);
        }
        if (isViewer) {
            // Viewers only see Overview, Knowledge, and Logs
            return ["/dashboard", "/dashboard/knowledge", "/dashboard/conversations"].includes(item.href);
        }
        // Admin and Owner see everything
        return true;
    });

    return (
        <aside className="w-16 md:w-64 bg-raised border-r border-accent/8 flex flex-col py-4 px-2 md:px-4 gap-2 sticky top-0 h-screen overflow-y-auto overflow-x-hidden text-primary">
            <div className="flex items-center gap-3 mb-6 px-2">
                <div className="w-7 h-7 bg-accent/10 text-accent border border-accent/20 rounded-[6px] flex items-center justify-center flex-shrink-0">
                    <Command size={14} />
                </div>
                <span className="hidden md:block text-[13px] font-display font-semibold tracking-tight text-primary">OmniChat</span>
            </div>
            
            <nav className="flex-1 space-y-6 mt-4">
                <div>
                    <h4 className="hidden md:block text-[11px] font-mono font-medium text-secondary uppercase tracking-wider px-2 mb-2">Tenant</h4>
                    <div className="space-y-0.5">
                        {filteredNavTenant.map(item => {
                            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`w-full flex items-center gap-3 px-2 py-2 rounded-[8px] transition-all text-left ${
                                        isActive
                                            ? "bg-accent/10 text-accent border-l-2 border-accent pl-[6px]"
                                            : "text-secondary hover:text-primary hover:bg-overlay/50"
                                    }`}
                                >
                                    <item.icon size={16} className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                                    <span className="hidden md:block text-[13px] font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {isAdmin && (
                    <div>
                        <h4 className="hidden md:block text-[11px] font-mono font-medium text-secondary uppercase tracking-wider px-2 mb-2">Admin</h4>
                        <div className="space-y-0.5">
                            {NAV_ADMIN.map(item => {
                                const isActive = pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`w-full flex items-center gap-3 px-2 py-2 rounded-[8px] transition-all text-left ${
                                            isActive
                                                ? "bg-accent/10 text-accent border-l-2 border-accent pl-[6px]"
                                                : "text-secondary hover:text-primary hover:bg-overlay/50"
                                        }`}
                                    >
                                        <item.icon size={16} className={`flex-shrink-0 ${isActive ? 'text-accent' : 'text-secondary'}`} />
                                        <span className="hidden md:block text-[13px] font-medium">{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </nav>

            {data && (
                <div className="pt-4 mt-2">
                    <button onClick={logout} className="w-full flex items-center gap-3 px-2 py-2 rounded-[8px] text-tertiary hover:text-primary hover:bg-overlay/50 transition-all">
                        <LogOut size={16} className="flex-shrink-0" />
                        <span className="hidden md:block text-[13px] font-medium">Sign out</span>
                    </button>
                </div>
            )}
        </aside>
    );
}

function DashboardTopBar() {
    const { data } = useDashboard();
    return (
        <header className="h-14 border-b border-accent/8 bg-base flex items-center justify-between px-6 sticky top-0 z-10 text-primary backdrop-blur-sm">
            <div className="flex items-center gap-2 text-[13px] font-medium text-secondary">
                <span>{data?.user?.email || "Workspace"}</span>
                <ChevronRight size={14} className="text-tertiary" />
                <span className="text-primary">Dashboard</span>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-2 bg-raised border border-accent/10 px-3 py-1.5 rounded-[8px] text-tertiary text-[13px] hover:border-accent/25 transition-colors cursor-pointer w-64">
                    <Search size={14} className="text-accent/50" />
                    <span className="flex-1 text-left font-mono text-[12px]">Search...</span>
                    <div className="flex items-center gap-1">
                        <kbd className="font-mono text-[10px] bg-base px-1.5 py-0.5 rounded-[4px] border border-border-subtle text-secondary">⌘</kbd>
                        <kbd className="font-mono text-[10px] bg-base px-1.5 py-0.5 rounded-[4px] border border-border-subtle text-secondary">K</kbd>
                    </div>
                </div>
            </div>
        </header>
    );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
    const { loading, error } = useDashboard();

    if (loading) return (
        <div className="min-h-screen bg-base flex-1 flex items-center justify-center text-primary">
            <div className="flex flex-col items-center gap-4 opacity-50">
                <div className="w-6 h-6 border-2 border-border-subtle border-t-primary rounded-full animate-spin" />
                <p className="text-[11px] font-mono font-medium uppercase tracking-wider text-secondary">Loading...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-base flex-1 flex items-center justify-center gap-3 text-error">
            <AlertCircle size={20} />
            <p className="font-sans font-medium text-[14px]">{error}</p>
        </div>
    );

    return (
        <div className="flex-1 flex flex-col min-h-screen bg-base text-primary overflow-hidden">
            <DashboardTopBar />
            <main className="flex-1 overflow-auto p-8">
                <div className="max-w-[1440px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <DashboardProvider>
            <div className="min-h-screen bg-base flex selection:bg-accent-soft selection:text-accent font-sans">
                <DashboardSidebar />
                <DashboardContent>{children}</DashboardContent>
            </div>
        </DashboardProvider>
    );
}
