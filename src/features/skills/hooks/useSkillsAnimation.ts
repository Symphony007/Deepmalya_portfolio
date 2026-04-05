import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FRAME_COUNT } from '../../../lib/frames';

gsap.registerPlugin(ScrollTrigger);

export interface UseSkillsAnimationProps {
  loaded: boolean;
  imagesRef: React.MutableRefObject<HTMLImageElement[]>;
  sectionRef: React.RefObject<HTMLElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  samuraiRef: React.RefObject<HTMLDivElement | null>;
  headingRef: React.RefObject<HTMLDivElement | null>;
  frontRingRef: React.RefObject<HTMLDivElement | null>;
  backRingRef: React.RefObject<HTMLDivElement | null>;
}

export function useSkillsAnimation({
  loaded,
  imagesRef,
  sectionRef,
  canvasRef,
  samuraiRef,
  headingRef,
  frontRingRef,
  backRingRef,
}: UseSkillsAnimationProps) {
  const playheadRef = useRef({ frame: 0 });

  useEffect(() => {
    if (!loaded) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const images = imagesRef.current;

    const render = (img: HTMLImageElement) => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      const cx = (canvas.width - img.width * ratio) / 2;
      const cy = (canvas.height - img.height * ratio) / 2;
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = 'high';
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
    };
    render(images[0]);

    gsap.set(samuraiRef.current, { yPercent: 100, opacity: 0 });
    gsap.set(frontRingRef.current, { opacity: 0, visibility: 'hidden' });
    gsap.set(backRingRef.current, { opacity: 0, visibility: 'hidden' });

    const gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=600%',
          scrub: 1,
          pin: true,
        },
      });

      tl.to(playheadRef.current, {
        frame: FRAME_COUNT - 1,
        snap: 'frame',
        ease: 'none',
        duration: 10,
        onUpdate: () => {
          const f = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(playheadRef.current.frame)));
          render(images[f]);
        },
      }, 0);

      tl.to(samuraiRef.current, {
        yPercent: 25,
        opacity: 1,
        duration: 2,
        ease: 'power2.out',
      }, 7);

      tl.to(headingRef.current, {
        y: -280,
        duration: 2,
        ease: 'power2.out',
      }, 7);

      // Both rings appear together
      tl.set(frontRingRef.current, { visibility: 'visible' }, 9.9);
      tl.to(frontRingRef.current, { opacity: 1, duration: 0.1, ease: 'none' }, 9.9);
      tl.set(backRingRef.current, { visibility: 'visible' }, 9.9);
      tl.to(backRingRef.current, { opacity: 1, duration: 0.1, ease: 'none' }, 9.9);

      // Hold-frame buffer before ProjectsSection unpin begins
      tl.to({}, { duration: 3.5 });
    }, section);

    // Force ScrollTrigger to recalculate after About's pin spacer is set up.
    // Without this, Skills' ScrollTrigger calculates its start position before
    // About's pin spacer is fully accounted for, causing the section to never
    // trigger correctly on production builds.
    ScrollTrigger.refresh();

    let resizeTimer: NodeJS.Timeout;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const f = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(playheadRef.current.frame)));
        render(images[f]);
      }, 150);
    };
    window.addEventListener('resize', onResize);

    return () => {
      gsapCtx.revert();
      window.removeEventListener('resize', onResize);
    };
  }, [loaded, imagesRef, sectionRef, canvasRef, samuraiRef, headingRef, frontRingRef, backRingRef]);
}