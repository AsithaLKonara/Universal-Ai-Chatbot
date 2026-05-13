import { useEffect, useRef } from "react";

/**
 * Cinematic video scrub hook.
 *
 * Key design decisions for maximum smoothness:
 * 1. Reads window.scrollY directly inside the rAF loop — avoids timing drift
 *    between Lenis virtual scroll and DOM scroll events.
 * 2. Checks video.readyState each frame — eliminates stale-closure bugs
 *    that prevented currentTime from ever being set.
 * 3. Compares video.currentTime against the lerped target to gate seeks —
 *    avoids issuing redundant seeks on static frames.
 * 4. Single stable effect with no state — zero re-renders, maximum fps.
 */
export function useVideoScrub(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const targetProgress = useRef(0);
    const currentProgress = useRef(0);
    const animFrameId = useRef<number>(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Hard-block any natural playback
        const blockPlay = () => { video.pause(); };
        video.addEventListener("play", blockPlay);

        let lastScrollY = -1;

        const tick = () => {
            // Read scroll position every frame (works correctly with Lenis)
            const scrollY = window.scrollY;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

            if (maxScroll > 0 && scrollY !== lastScrollY) {
                targetProgress.current = Math.min(Math.max(scrollY / maxScroll, 0), 1);
                lastScrollY = scrollY;
            }

            // Lerp: smooth glide toward target (0.1 = cinematic, 0.2 = snappier)
            const diff = targetProgress.current - currentProgress.current;
            currentProgress.current += diff * 0.1;

            // Apply to video only when metadata is available and change is meaningful
            if (
                video.readyState >= 1 &&
                !isNaN(video.duration) &&
                video.duration > 0
            ) {
                const targetTime = currentProgress.current * video.duration;
                // Gate: avoid micro-seeks that cause browser stuttering
                if (Math.abs(video.currentTime - targetTime) > 0.01) {
                    video.currentTime = targetTime;
                }
            }

            animFrameId.current = requestAnimationFrame(tick);
        };

        animFrameId.current = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(animFrameId.current);
            video.removeEventListener("play", blockPlay);
        };
    }, [videoRef]);
}
