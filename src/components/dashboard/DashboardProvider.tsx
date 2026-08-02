"use client";
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface Project { 
    id: string; 
    name: string; 
    apiKey: string; 
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

function authHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export function DashboardProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/login"); return; }
        try {
            const res = await fetch("/api/user/dashboard", { headers: authHeaders() });
            if (res.status === 401) { 
                localStorage.removeItem("token"); 
                router.push("/login"); 
                return; 
            }
            if (!res.ok) throw new Error("Connection Failure");
            const json = await res.json();
            setData(json);
        } catch (e: any) { 
            setError(e.message); 
        } finally { 
            setLoading(false); 
        }
    }, [router]);

    useEffect(() => { 
        fetchData(); 
    }, [fetchData]);

    const logout = useCallback(() => {
        localStorage.removeItem("token");
        router.push("/login");
    }, [router]);

    return (
        <DashboardContext.Provider value={{
            data,
            projects: data?.projects || [],
            loading,
            error,
            refreshData: fetchData,
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
