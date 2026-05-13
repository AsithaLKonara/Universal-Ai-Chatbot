import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Ultra-smooth cinematic video scrub engine.
 *
 * Architecture: decoupled double-lerp via GSAP ticker
 *
 *   [user scroll] ──→ targetScrollProgress (raw, instant)
 *        ↓ lerp 1 (factor 0.05, heavy damping)
 *   currentScrollProgress (virtual cinematic scroll)
 *        ↓ multiply by duration
 *   targetVideoTime
 *        ↓ lerp 2 (factor 0.12, catches up to scroll)
 *   smoothVideoTime → video.currentTime
 *
 * The two-stage lerp is what separates cinematic motion from choppy scrubbing.
 * Layer 1 smooths the SCROLL feel (heavy inertia).
 * Layer 2 smooths the VIDEO SEEK (prevents hard frame jumps from browser decode lag).
 *
 * GSAP ticker is used as the master loop because:
 * - It handles tab-visibility pausing automatically
 * - It runs inside the same RAF frame as Lenis (when co-ticked)
 * - It uses lagSmoothing(0) to avoid huge jumps after tab switch
 */
export function useVideoScrub(
    videoRef: React.RefObject<HTMLVideoElement | null>,
    lenisRef?: React.RefObject<any>
) {
    // All animation state is in refs — zero React re-renders during playback
    const targetScrollProgress = useRef(0);
    const currentScrollProgress = useRef(0);
    const targetVideoTime = useRef(0);
    const smoothVideoTime = useRef(0);
    const hasMetadata = useRef(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // ── Block all natural playback ──────────────────────────────────────
        const blockPlay = () => { video.pause(); };
        video.addEventListener("play", blockPlay);
        video.pause();

        // ── GPU acceleration hints ──────────────────────────────────────────
        video.style.willChange = "transform";
        video.style.transform = "translateZ(0)";
        video.style.backfaceVisibility = "hidden";

        // ── Metadata listener ───────────────────────────────────────────────
        const onMeta = () => { hasMetadata.current = true; };
        if (video.readyState >= 1) {
            hasMetadata.current = true;
        } else {
            video.addEventListener("loadedmetadata", onMeta);
        }

        // ── Scroll listener (ONLY updates target, never currentTime) ────────
        const onScroll = () => {
            const scrollTop = window.scrollY;
            const maxScroll =
                document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
                targetScrollProgress.current = Math.min(
                    Math.max(scrollTop / maxScroll, 0),
                    1
                );
            }
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll(); // initialise immediately on mount

        // ── GSAP Ticker: Master animation loop ──────────────────────────────
        // lagSmoothing(0) prevents a giant seek jump when the user switches tabs
        gsap.ticker.lagSmoothing(0);
        gsap.ticker.fps(60);

        const tick = () => {
            // LAYER 1: Smooth scroll progress (heavy inertia, cinematic feel)
            currentScrollProgress.current +=
                (targetScrollProgress.current - currentScrollProgress.current) *
                0.05;

            if (!hasMetadata.current) return;
            const duration = video.duration;
            if (!duration || isNaN(duration)) return;

            // LAYER 2: Smooth video time (prevents hard browser decode jumps)
            targetVideoTime.current = currentScrollProgress.current * duration;
            smoothVideoTime.current +=
                (targetVideoTime.current - smoothVideoTime.current) * 0.12;

            // Only write to the DOM when the delta is meaningful
            // Micro-seeks (<5ms) cause browser jitter without visual benefit
            if (
                Math.abs(video.currentTime - smoothVideoTime.current) > 0.005
            ) {
                video.currentTime = smoothVideoTime.current;
            }
        };

        gsap.ticker.add(tick);

        return () => {
            gsap.ticker.remove(tick);
            window.removeEventListener("scroll", onScroll);
            video.removeEventListener("play", blockPlay);
            video.removeEventListener("loadedmetadata", onMeta);
        };
    }, [videoRef]);
}
