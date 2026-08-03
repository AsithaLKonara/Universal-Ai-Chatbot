export default function DashboardLoading() {
    return (
        <div className="w-full h-full min-h-[50vh] flex flex-col items-center justify-center space-y-4 opacity-40">
            <div className="w-8 h-8 border-2 border-foreground/30 border-t-ion rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Loading Module...</p>
        </div>
    );
}
