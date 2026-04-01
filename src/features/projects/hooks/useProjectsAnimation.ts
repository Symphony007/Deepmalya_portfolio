import React, { useEffect } from 'react';

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export interface UseProjectsAnimationProps {
  wrapRef: React.RefObject<HTMLElement | null>;
  paperRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
  botRef: React.RefObject<HTMLDivElement | null>;
  leftDoorRef: React.RefObject<HTMLDivElement | null>;
  rightDoorRef: React.RefObject<HTMLDivElement | null>;
  scrollWrapRef: React.RefObject<HTMLDivElement | null>;
  innerWrapRef: React.RefObject<HTMLDivElement | null>;
}

export function useProjectsAnimation({
  wrapRef,
  paperRef,
  contentRef,
  botRef,
  leftDoorRef,
  rightDoorRef,
  scrollWrapRef,
  innerWrapRef,
}: UseProjectsAnimationProps) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const paper = paperRef.current;
    const content = contentRef.current;
    if (!wrap || !paper || !content) return;

    const ROLLED_H = 140;

    // FIX #2: Use `let` so the resize handler can update these before
    // re-firing onScroll. Closures capture the variable binding, not the
    // value, so onScroll will always read the latest vh and OPEN_H.
    let vh = window.innerHeight;
    let OPEN_H = vh * 0.76;

    paper.style.height = `${ROLLED_H}px`;
    content.style.transform = 'translateY(0)';

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const wrapH = wrap.offsetHeight;
      const scrollRange = wrapH - vh;
      const scrolled = -rect.top;

      // ── Off-screen above ───────────────────────────────────────────────
      if (scrolled < -vh) {
        if (innerWrapRef.current) {
          innerWrapRef.current.style.transform = 'translateY(-200%)';
          innerWrapRef.current.style.opacity = '0';
        }
        paper.style.height = `${ROLLED_H}px`;
        content.style.transform = 'translateY(0)';
        return;
      }

      // Past the off-screen above state — ensure the wrapper is definitely visible
      if (innerWrapRef.current) innerWrapRef.current.style.opacity = '1';

      // ── Off-screen below — enforce fully-open final state ─────────────
      if (scrolled > scrollRange) {
        if (innerWrapRef.current) innerWrapRef.current.style.transform = 'translateY(0%)';
        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform = 'translateX(-100%)';
          rightDoorRef.current.style.transform = 'translateX(100%)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity = '1';
          scrollWrapRef.current.style.transform = 'scale(1)';
        }
        paper.style.height = `${OPEN_H}px`;
        if (content) {
          const overflow = Math.max(0, content.scrollHeight - OPEN_H + 80);
          content.style.transform = `translateY(${-overflow}px)`;
        }
        return;
      }

      // ── PHASE 0: Sliding in from above ────────────────────────────────
      if (scrolled <= 0) {
        const tDrop = (scrolled + vh) / vh; // 0 → 1
        if (innerWrapRef.current) {
          innerWrapRef.current.style.opacity = '1';
          innerWrapRef.current.style.transform = `translateY(${-200 + tDrop * 200}%)`;
        }
        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform = 'translateX(0%)';
          rightDoorRef.current.style.transform = 'translateX(0%)';
          leftDoorRef.current.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.8)';
          rightDoorRef.current.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.8)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity = '0';
          scrollWrapRef.current.style.transform = 'scale(0.96)';
        }
        paper.style.height = `${ROLLED_H}px`;
        content.style.transform = 'translateY(0)';
        return;
      }

      // Past the drop phase — inner wrap is fully in view
      if (innerWrapRef.current) innerWrapRef.current.style.transform = 'translateY(0%)';

      const progress = scrolled / scrollRange; // 0 → 1
      const overflow = Math.max(0, content.scrollHeight - OPEN_H + 80);

      // ── PHASE 1 (0% – 25%): Shoji doors slide open ────────────────────
      if (progress <= 0.25) {
        const t = easeInOutCubic(progress / 0.25);

        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform = `translateX(${-t * 100}%)`;
          rightDoorRef.current.style.transform = `translateX(${t * 100}%)`;
          leftDoorRef.current.style.boxShadow = `10px 0 ${15 + t * 40}px rgba(0,0,0,${0.3 + t * 0.4})`;
          rightDoorRef.current.style.boxShadow = `-10px 0 ${15 + t * 40}px rgba(0,0,0,${0.3 + t * 0.4})`;
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity = t < 0.1 ? '0' : String(Math.min(1, (t - 0.1) * 2));
          scrollWrapRef.current.style.transform = `scale(${0.96 + t * 0.04})`;
        }
        paper.style.height = `${ROLLED_H}px`;
        content.style.transform = 'translateY(0)';
      }

      // ── PHASE 2 (25% – 50%): Scroll unrolls downward ──────────────────
      else if (progress <= 0.5) {
        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform = 'translateX(-100%)';
          rightDoorRef.current.style.transform = 'translateX(100%)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity = '1';
          scrollWrapRef.current.style.transform = 'scale(1)';
        }

        const t = easeInOutCubic((progress - 0.25) / 0.25);
        const h = ROLLED_H + (OPEN_H - ROLLED_H) * t;
        paper.style.height = `${h}px`;
        content.style.transform = 'translateY(0)';

        if (botRef.current) {
          const rollDist = h - ROLLED_H;
          const texEls = botRef.current.querySelectorAll('.roller-tex') as NodeListOf<HTMLElement>;
          texEls.forEach((el) => (el.style.backgroundPositionY = `${-rollDist * 1.5}px`));
        }
      }

      // ── PHASE 3 (50% – 100%): Content scrolls upward ──────────────────
      else {
        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform = 'translateX(-100%)';
          rightDoorRef.current.style.transform = 'translateX(100%)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity = '1';
          scrollWrapRef.current.style.transform = 'scale(1)';
        }

        paper.style.height = `${OPEN_H}px`;
        const t = (progress - 0.5) / 0.5;
        content.style.transform = `translateY(${-overflow * t}px)`;

        if (botRef.current) {
          const maxUnroll = OPEN_H - ROLLED_H;
          const texEls = botRef.current.querySelectorAll('.roller-tex') as NodeListOf<HTMLElement>;
          texEls.forEach((el) => (el.style.backgroundPositionY = `${-maxUnroll * 1.5}px`));
        }
      }
    };

    let ticking = false;
    const onScrollRaw = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          onScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    // FIX #2: Recalculate vh and OPEN_H on resize, then re-fire scroll
    // handler so all phases immediately reflect the new dimensions.
    const onResize = () => {
      vh = window.innerHeight;
      OPEN_H = vh * 0.76;
      onScrollRaw();
    };

    window.addEventListener('scroll', onScrollRaw, { passive: true });
    window.addEventListener('resize', onResize);
    onScrollRaw();

    return () => {
      window.removeEventListener('scroll', onScrollRaw);
      window.removeEventListener('resize', onResize);
    };
  }, [wrapRef, paperRef, contentRef, botRef, leftDoorRef, rightDoorRef, scrollWrapRef, innerWrapRef]);
}