import { useEffect, useRef, useState } from "react";

/**
 * A custom hook to sync a video's currentTime with the page's scroll position.
 * Uses requestAnimationFrame and linear interpolation (lerp) for cinematic smoothness.
 */
export function useVideoScrub(videoRef: React.RefObject<HTMLVideoElement | null>) {
    const targetProgress = useRef(0);
    const currentProgress = useRef(0);
    const animationFrameId = useRef<number>(0);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Ensure video doesn't play naturally
        video.pause();

        const handleLoadedMetadata = () => {
            setIsLoaded(true);
            video.pause(); // Double ensure
        };

        if (video.readyState >= 1) {
            setIsLoaded(true);
        } else {
            video.addEventListener("loadedmetadata", handleLoadedMetadata);
        }

        const handleScroll = () => {
            // Calculate how far down the page we are (0.0 to 1.0)
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            
            if (docHeight > 0) {
                targetProgress.current = Math.min(Math.max(scrollTop / docHeight, 0), 1);
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll(); // Init immediately

        const renderLoop = () => {
            // Lerp formula: current += (target - current) * friction
            currentProgress.current += (targetProgress.current - currentProgress.current) * 0.08;

            if (video && isLoaded && !isNaN(video.duration) && video.duration > 0) {
                // Prevent micro-stutters by only updating if the difference is significant
                if (Math.abs(targetProgress.current - currentProgress.current) > 0.0001) {
                    video.currentTime = currentProgress.current * video.duration;
                }
            }

            animationFrameId.current = requestAnimationFrame(renderLoop);
        };

        renderLoop();

        return () => {
            window.removeEventListener("scroll", handleScroll);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
            video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
    }, [videoRef, isLoaded]);

    return { isLoaded };
}
