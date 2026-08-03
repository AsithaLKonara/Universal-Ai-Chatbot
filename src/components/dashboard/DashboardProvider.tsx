"use client";
import { createContext, useContext, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";

export interface Project { 
    id: string; 
    name: string; 
    apiKey: string; 
    projectRole: string;
    conversations: number; 
    tokens: number; 
    createdAt: string; 
}

export interface DashboardData { 
    user: { id: string; email: string; plan: string; role: string }; 
    projects: Project[]; 
    usage: { total: number; daily: number; limit: number }; 
}

interface DashboardContextType {
    data: DashboardData | null;
    projects: Project[];
    loading: boolean;
    error: string | null;
    refreshData: () => Promise<void>;
    logout: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

const fetcher = async (url: string) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    if (!token) throw new Error("Unauthorized");
    const res = await fetch(url, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) {
        localStorage.removeItem("token");
        if (typeof document !== 'undefined') {
            document.cookie = 'token=; Max-Age=0; path=/';
        }
        throw new Error("Unauthorized");
    }
    if (!res.ok) throw new Error("Connection Failure");
    return res.json();
};

export function DashboardProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const { data, error, isLoading, mutate } = useSWR<DashboardData>("/api/user/dashboard", fetcher);

    useEffect(() => {
        if (error?.message === "Unauthorized") {
            router.push("/login");
        }
    }, [error, router]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push("/login");
    }, [router]);

    return (
        <DashboardContext.Provider value={{
            data: data || null,
            projects: data?.projects || [],
            loading: isLoading,
            error: error?.message || null,
            refreshData: async () => { await mutate(); },
            logout
        }}>
            {children}
        </DashboardContext.Provider>
    );
}

export function useDashboard() {
    const context = useContext(DashboardContext);
    if (context === undefined) {
        throw new Error("useDashboard must be used within a DashboardProvider");
    }
    return context;
}
