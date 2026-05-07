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
  rootMargin = '1200px 0px',
}: UseFrameLoaderOptions) {
  const [loaded, setLoaded] = useState(false);
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

        // Safety fallback: GSAP ScrollTrigger pin spacers created by sibling
        // sections can push this element far down the page *after* the
        // IntersectionObserver is set up, causing the initial async callback
        // to see the element as out-of-range. Force loading after 5 s.
        const fallbackTimer = setTimeout(() => {
          if (!startedLoading) {
            startLoading();
            observer.disconnect();
          }
        }, 5000);

        return () => {
          clearTimeout(fallbackTimer);
          observer.disconnect();
        };
      } else {
        startLoading();
      }
    } else {
      startLoading();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameCount, framePath, priorityFrames, rootMargin]);

  return { loaded, imagesRef };
}