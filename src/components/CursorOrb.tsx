"use client";
import { useEffect, useRef } from "react";

export function CursorOrb() {
    const orbRef = useRef<HTMLDivElement>(null);
    const posRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    const currentRef = useRef({ x: typeof window !== 'undefined' ? window.innerWidth / 2 : 0, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 0 });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        // Check reduced motion
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const handleMove = (e: MouseEvent) => {
            posRef.current = { x: e.clientX, y: e.clientY };
        };

        const animate = () => {
            // Lerp toward target position
            currentRef.current.x += (posRef.current.x - currentRef.current.x) * 0.08;
            currentRef.current.y += (posRef.current.y - currentRef.current.y) * 0.08;

            document.documentElement.style.setProperty("--mouse-x", `${currentRef.current.x}px`);
            document.documentElement.style.setProperty("--mouse-y", `${currentRef.current.y}px`);

            if (orbRef.current) {
                orbRef.current.style.left = `${currentRef.current.x}px`;
                orbRef.current.style.top = `${currentRef.current.y}px`;
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        window.addEventListener("mousemove", handleMove, { passive: true });
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <div
            ref={orbRef}
            aria-hidden="true"
            className="cursor-orb"
            style={{
                position: "fixed",
                pointerEvents: "none",
                zIndex: 9998,
                width: 500,
                height: 500,
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(0,212,216,0.18) 0%, rgba(0,212,216,0.06) 35%, transparent 70%)",
                transform: "translate(-50%, -50%)",
                mixBlendMode: "screen",
            }}
        />
    );
}

// Card lens effect — tracks cursor within each card
export function useCardLens(ref: React.RefObject<HTMLElement | null>) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            el.style.setProperty("--card-mouse-x", `${x}%`);
            el.style.setProperty("--card-mouse-y", `${y}%`);
        };

        el.addEventListener("mousemove", handleMove, { passive: true });
        return () => el.removeEventListener("mousemove", handleMove);
    }, [ref]);
}

// Magnetic button hook
export function useMagnetic(ref: React.RefObject<HTMLElement | null>, strength = 0.3) {
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

        const handleMove = (e: MouseEvent) => {
            const rect = el.getBoundingClientRect();
            const cx = rect.left + rect.width / 2;
            const cy = rect.top + rect.height / 2;
            const dx = e.clientX - cx;
            const dy = e.clientY - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const radius = Math.max(rect.width, rect.height) * 1.5;

            if (dist < radius) {
                const pull = (1 - dist / radius) * strength;
                el.style.transform = `translate(${dx * pull}px, ${dy * pull}px)`;
            }
        };

        const handleLeave = () => {
            el.style.transform = "translate(0, 0)";
        };

        el.addEventListener("mousemove", handleMove, { passive: true });
        el.addEventListener("mouseleave", handleLeave);
        return () => {
            el.removeEventListener("mousemove", handleMove);
            el.removeEventListener("mouseleave", handleLeave);
        };
    }, [ref, strength]);
}
