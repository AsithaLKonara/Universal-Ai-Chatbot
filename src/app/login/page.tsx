"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ShieldCheck, AlertCircle, Info, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    // Animated particle mesh for left panel
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d")!;
        let raf: number;
        let t = 0;

        const resize = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resize();
        window.addEventListener("resize", resize);

        const nodes: { x: number; y: number; vx: number; vy: number }[] = Array.from({ length: 60 }, () => ({
            x: Math.random() * canvas.offsetWidth,
            y: Math.random() * canvas.offsetHeight,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
        }));

        const draw = () => {
            t += 0.008;
            ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            // Move nodes
            nodes.forEach(n => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > canvas.offsetWidth) n.vx *= -1;
                if (n.y < 0 || n.y > canvas.offsetHeight) n.vy *= -1;
            });

            // Draw connections
            nodes.forEach((a, i) => {
                nodes.slice(i + 1).forEach(b => {
                    const dx = a.x - b.x, dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 120) {
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(0, 212, 216, ${(1 - dist / 120) * 0.15})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                });
            });

            // Draw nodes
            nodes.forEach(n => {
                ctx.beginPath();
                ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 212, 216, 0.35)";
                ctx.fill();
            });

            // Aqua orb
            const orbX = canvas.offsetWidth * 0.5 + Math.sin(t * 0.5) * 60;
            const orbY = canvas.offsetHeight * 0.5 + Math.cos(t * 0.3) * 40;
            const grd = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 200);
            grd.addColorStop(0, "rgba(0, 212, 216, 0.12)");
            grd.addColorStop(1, "transparent");
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

            raf = requestAnimationFrame(draw);
        };
        draw();
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
    }, []);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("token", data.token);
                document.cookie = `token=${data.token}; path=/`;
                if (data.user?.role === "ADMIN" || data.user?.role === "OWNER") {
                    router.push("/dashboard/admin/tenants");
                } else if (data.user?.memberships?.length > 0 && data.user.memberships[0].role === "EDITOR") {
                    router.push("/dashboard/inbox");
                } else {
                    router.push("/dashboard");
                }
            } else {
                const data = await res.json();
                setError(data.error || "Invalid credentials");
            }
        } catch {
            setError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-base text-primary flex overflow-hidden">
            {/* ── Left: animated mesh panel ── */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 overflow-hidden">
                <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

                {/* Aqua ambient blobs */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-accent/10 blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-accent/06 blur-[80px] pointer-events-none" />

                <div className="relative z-10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight text-primary">OmniChat</span>
                    </Link>
                </div>

                <div className="relative z-10 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                        <span className="text-[12px] font-mono text-accent">System Online</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight leading-tight text-primary">
                        The cognitive<br />
                        <span className="text-aqua-gradient">commerce layer.</span>
                    </h2>
                    <p className="text-secondary text-[15px] leading-relaxed max-w-sm">
                        Autonomous AI that bridges the gap between intention and transaction. Thousands of merchants trust OmniChat.
                    </p>

                    {/* Stats */}
                    <div className="flex gap-8 pt-4">
                        {[["12k+", "Merchants"], ["98%", "Uptime"], ["<1s", "Response"]].map(([n, l]) => (
                            <div key={l}>
                                <div className="text-2xl font-bold text-aqua-gradient">{n}</div>
                                <div className="text-[12px] text-tertiary">{l}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 flex items-center gap-2 text-tertiary">
                    <ShieldCheck size={14} className="text-accent/50" />
                    <span className="text-[12px] font-mono">256-bit encrypted connection</span>
                </div>
            </div>

            {/* ── Right: borderless form ── */}
            <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 md:p-16 relative">
                {/* Mobile logo */}
                <div className="lg:hidden mb-12 self-start">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-[10px] bg-accent/10 border border-accent/20 flex items-center justify-center">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-accent">
                                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"/>
                            </svg>
                        </div>
                        <span className="text-[15px] font-semibold tracking-tight">OmniChat</span>
                    </Link>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="w-full max-w-[400px]"
                >
                    <div className="mb-10">
                        <h1 className="text-3xl font-bold tracking-tight text-primary mb-2">Welcome back.</h1>
                        <p className="text-secondary text-[15px]">Sign in to your OmniChat workspace</p>
                    </div>

                    {/* Dev shortcuts */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {[
                            ["admin@universal.ai", "Admin"],
                            ["owner@startup.com", "Owner"],
                            ["agent@startup.com", "Agent"],
                            ["viewer@startup.com", "Viewer"]
                        ].map(([e, l]) => (
                            <button
                                key={l}
                                type="button"
                                onClick={() => { setEmail(e); setPassword("password123"); }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-raised border border-border-subtle text-tertiary hover:text-secondary hover:border-accent/20 rounded-lg text-[11px] font-mono transition-all"
                            >
                                <Info size={11} /> {l}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-3 px-4 py-3 bg-error/8 border border-error/15 rounded-xl text-error text-[13px] mb-6"
                            >
                                <AlertCircle size={15} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-8">
                        {/* Email */}
                        <div>
                            <label className="text-[11px] font-mono text-accent uppercase tracking-widest mb-3 block">Email</label>
                            <input
                                type="email"
                                placeholder="you@company.com"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="input-underline"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <label className="text-[11px] font-mono text-accent uppercase tracking-widest">Password</label>
                                <Link href="/forgot-password" className="text-[12px] text-tertiary hover:text-accent transition-colors">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                                    className="input-underline pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-0 bottom-3 text-tertiary hover:text-secondary transition-colors"
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <motion.button
                        onClick={handleLogin}
                        disabled={loading || !email || !password}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full mt-10 py-4 rounded-xl bg-accent text-base font-semibold text-[15px] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        style={{ boxShadow: "0 0 32px rgba(0,212,216,0.25)" }}
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-base/30 border-t-base rounded-full animate-spin" />
                                Signing in...
                            </span>
                        ) : (
                            <><span>Continue</span><ArrowRight size={18} /></>
                        )}
                    </motion.button>

                    <p className="text-center text-[13px] text-tertiary mt-8">
                        No account yet?{" "}
                        <Link href="/register" className="text-accent hover:text-accent-dark transition-colors font-medium">
                            Sign up free
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
