import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionValue } from "framer-motion";

interface CanvasSequenceOptions {
  frameCount: number;
  getFrameUrl: (index: number) => string;
  lerpScroll?: number;
  lerpFrame?: number;
  progress?: MotionValue<number>;
}

/**
 * Ultra-smooth Apple-style Canvas Image Sequence Engine.
 * 
 * Optimized for Mobile/Low-End devices:
 * 1. Lazy Progressive Preloading (First 5 frames unblock render).
 * 2. Render Caching (Only draw if frame changes).
 * 3. Debounced Resizing.
 * 4. GSAP Ticker for frame-perfect sync.
 */
export function useCanvasSequence(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  {
    frameCount,
    getFrameUrl,
    lerpScroll = 0.05,
    lerpFrame = 0.12,
    progress,
  }: CanvasSequenceOptions
) {
  const images = useRef<HTMLImageElement[]>([]);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const targetFrame = useRef(0);
  const smoothFrame = useRef(0);
  const isReady = useRef(false);
  const lastDrawnFrame = useRef(-1);

  useEffect(() => {
    // Disable heavy canvas animations on mobile devices
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // 1. Progressive Preload Strategy
    const INITIAL_FRAMES = Math.min(5, frameCount);
    let loadedCount = 0;

    const loadFrame = (i: number, isInitial: boolean) => {
      const img = new Image();
      img.src = getFrameUrl(i);
      img.onload = () => {
        if (isInitial) {
          loadedCount++;
          if (loadedCount === INITIAL_FRAMES) {
            isReady.current = true;
            // Unblock rendering, then lazy load the rest in background
            if (INITIAL_FRAMES < frameCount) {
              requestIdleCallback ? requestIdleCallback(loadRemaining) : setTimeout(loadRemaining, 100);
            }
          }
        }
      };
      images.current[i - 1] = img;
    };

    const loadRemaining = () => {
      for (let i = INITIAL_FRAMES + 1; i <= frameCount; i++) {
        loadFrame(i, false);
      }
    };

    for (let i = 1; i <= INITIAL_FRAMES; i++) {
      loadFrame(i, true);
    }

    // 2. High DPI Scaling with Debounce
    let resizeTimer: NodeJS.Timeout;
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvasWidth = window.innerWidth;
      canvasHeight = window.innerHeight;
      
      canvas.width = canvasWidth * dpr;
      canvas.height = canvasHeight * dpr;
      canvas.style.width = `${canvasWidth}px`;
      canvas.style.height = `${canvasHeight}px`;
      ctx.scale(dpr, dpr);
      lastDrawnFrame.current = -1; // Force redraw on resize
    };

    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resizeCanvas, 150);
    };

    window.addEventListener("resize", onResize);
    resizeCanvas(); // Initial execution

    // 3. Scroll Listener
    let unsubscribeProgress: () => void;
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetProgress.current = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      }
    };

    if (progress) {
      unsubscribeProgress = progress.on("change", (latest) => {
        targetProgress.current = Math.min(Math.max(latest, 0), 1);
      });
    } else {
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    // 4. Master Animation Loop (GSAP Ticker)
    const render = () => {
      if (!isReady.current) return;

      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpScroll;
      targetFrame.current = currentProgress.current * (frameCount - 1);
      smoothFrame.current += (targetFrame.current - smoothFrame.current) * lerpFrame;

      const frameIndex = Math.round(smoothFrame.current);
      
      // Optimization: Only render if frame actually changed!
      if (frameIndex === lastDrawnFrame.current) return;

      const img = images.current[frameIndex];

      if (img && img.complete) {
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        const x = (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, newWidth, newHeight);
        
        lastDrawnFrame.current = frameIndex;
      }
    };

    gsap.ticker.add(render);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", onResize);
      if (unsubscribeProgress) unsubscribeProgress();
      else window.removeEventListener("scroll", onScroll);
      clearTimeout(resizeTimer);
    };
  }, [canvasRef, frameCount, getFrameUrl, lerpScroll, lerpFrame, progress]);
}

