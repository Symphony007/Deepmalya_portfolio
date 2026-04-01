import React, { useState, useEffect, useRef } from 'react';

interface UseFrameLoaderOptions {
  frameCount: number;
  framePath: (index: number) => string;
  priorityFrames: number;
  intersectionRef?: React.RefObject<HTMLElement | null>;
  rootMargin?: string;
}

export function useFrameLoader({
  frameCount,
  framePath,
  priorityFrames,
  intersectionRef,
  rootMargin = '600px 0px',
}: UseFrameLoaderOptions) {
  const [loaded, setLoaded] = useState(false);

  // FIX #6: Use a plain empty array instead of new Array(frameCount).
  // new Array(n) creates a sparse array with n empty slots, which is
  // confusing for TypeScript and unnecessary here since we assign by index.
  const imagesRef = useRef<HTMLImageElement[]>([]);

  useEffect(() => {
    let n = 0;
    let failed = 0;
    let unlocked = false;
    let startedLoading = false;

    const onSettle = () => {
      if (!unlocked && (n >= priorityFrames || n + failed === frameCount)) {
        setLoaded(true);
        unlocked = true;
      }
      if (n + failed === frameCount && failed > 0) {
        console.warn(`[useFrameLoader] ${failed} frame(s) failed to load.`);
      }
    };

    const loadFrame = (i: number) => {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => { n++; onSettle(); };
      img.onerror = () => { failed++; onSettle(); };
      imagesRef.current[i - 1] = img;
    };

    const startLoading = () => {
      if (startedLoading) return;
      startedLoading = true;

      for (let i = 1; i <= Math.min(priorityFrames, frameCount); i++) {
        loadFrame(i);
      }

      const loadRest = () => {
        for (let i = priorityFrames + 1; i <= frameCount; i++) {
          loadFrame(i);
        }
      };

      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadRest);
      } else {
        setTimeout(loadRest, 200);
      }
    };

    if (intersectionRef) {
      if (intersectionRef.current) {
        // Normal case: ref is attached, observe the element.
        const observer = new IntersectionObserver(
          (entries) => {
            if (entries[0].isIntersecting) {
              startLoading();
              observer.disconnect();
            }
          },
          { rootMargin }
        );
        observer.observe(intersectionRef.current);
        return () => observer.disconnect();
      } else {
        // FIX #3: ref was provided but .current is null (e.g. component
        // rendered but ref not yet attached). Fall back to loading immediately
        // so frames are never silently skipped.
        startLoading();
      }
    } else {
      // No ref provided at all — load immediately.
      startLoading();
    }
  // FIX #8: intersectionRef is a stable RefObject (same object reference
  // across renders) so including it in the dep array is harmless at runtime
  // but triggers ESLint's exhaustive-deps rule. We intentionally omit it
  // here — the effect only needs to run once on mount.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, framePath, priorityFrames, rootMargin]);

  return { loaded, imagesRef };
}