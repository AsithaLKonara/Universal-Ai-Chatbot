import { useEffect, useRef } from "react";
import gsap from "gsap";

interface CanvasSequenceOptions {
  frameCount: number;
  getFrameUrl: (index: number) => string;
  lerpScroll?: number;
  lerpFrame?: number;
}

/**
 * Ultra-smooth Apple-style Canvas Image Sequence Engine.
 * 
 * Architecture:
 * 1. Double-lerp pipeline (Scroll -> Frame Index -> Rendered Frame).
 * 2. GSAP Ticker for frame-perfect sync with Lenis and browser RAF.
 * 3. High DPI canvas management.
 * 4. Progressive preloading.
 */
export function useCanvasSequence(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  {
    frameCount,
    getFrameUrl,
    lerpScroll = 0.05,
    lerpFrame = 0.12,
  }: CanvasSequenceOptions
) {
  const images = useRef<HTMLImageElement[]>([]);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const targetFrame = useRef(0);
  const smoothFrame = useRef(0);
  const isPreloaded = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // 1. Preload Images
    const preloadImages = () => {
      let loadedCount = 0;
      for (let i = 1; i <= frameCount; i++) {
        const img = new Image();
        img.src = getFrameUrl(i);
        img.onload = () => {
          loadedCount++;
          if (loadedCount === frameCount) {
            isPreloaded.current = true;
          }
        };
        images.current[i - 1] = img;
      }
    };

    preloadImages();

    // 2. High DPI Scaling
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // 3. Scroll Listener
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll > 0) {
        targetProgress.current = Math.min(Math.max(scrollTop / maxScroll, 0), 1);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    // 4. Master Animation Loop (GSAP Ticker)
    const render = () => {
      if (!isPreloaded.current) return;

      // LERP 1: Scroll progress smoothing
      currentProgress.current += (targetProgress.current - currentProgress.current) * lerpScroll;

      // LERP 2: Frame index smoothing
      targetFrame.current = currentProgress.current * (frameCount - 1);
      smoothFrame.current += (targetFrame.current - smoothFrame.current) * lerpFrame;

      const frameIndex = Math.round(smoothFrame.current);
      const img = images.current[frameIndex];

      if (img && img.complete) {
        // Draw image covering the canvas (center cover)
        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;
        const imgWidth = img.width;
        const imgHeight = img.height;
        const ratio = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
        const newWidth = imgWidth * ratio;
        const newHeight = imgHeight * ratio;
        const x = (canvasWidth - newWidth) / 2;
        const y = (canvasHeight - newHeight) / 2;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        ctx.drawImage(img, x, y, newWidth, newHeight);
      }
    };

    gsap.ticker.add(render);

    return () => {
      gsap.ticker.remove(render);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("scroll", onScroll);
    };
  }, [canvasRef, frameCount, getFrameUrl, lerpScroll, lerpFrame]);
}
