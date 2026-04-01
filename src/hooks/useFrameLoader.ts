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
  const imagesRef = useRef<HTMLImageElement[]>(new Array(frameCount));

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

    if (intersectionRef && intersectionRef.current) {
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
    } else if (!intersectionRef) {
      startLoading();
    }
  }, [frameCount, framePath, priorityFrames, intersectionRef, rootMargin]);

  return { loaded, imagesRef };
}
