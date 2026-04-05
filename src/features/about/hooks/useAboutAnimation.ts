import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FRAME_COUNT } from '../../../lib/frames';

gsap.registerPlugin(ScrollTrigger);

const BLADE_H = 220;
const CLEARANCE = 40;
const BLADE_DRAW_Y = -(BLADE_H + CLEARANCE);

function buildBlobPath(
  ctx: CanvasRenderingContext2D,
  cx: number, cy: number,
  r: number,
  seeds: number[]
) {
  const points = seeds.length / 2;
  const angleStep = (Math.PI * 2) / points;
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const jitter = seeds[i * 2];
    const rad = r * (1 + jitter * 0.28);
    pts.push([cx + Math.cos(angle) * rad, cy + Math.sin(angle) * rad]);
  }
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const p0 = pts[(i - 1 + points) % points];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % points];
    const p3 = pts[(i + 2) % points];
    const t = 0.4;
    const cp1x = p1[0] + (p2[0] - p0[0]) * t / 2;
    const cp1y = p1[1] + (p2[1] - p0[1]) * t / 2;
    const cp2x = p2[0] - (p3[0] - p1[0]) * t / 2;
    const cp2y = p2[1] - (p3[1] - p1[1]) * t / 2;
    if (i === 0) ctx.moveTo(p1[0], p1[1]);
    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2[0], p2[1]);
  }
  ctx.closePath();
}

function seededRands(count: number, seed = 42): number[] {
  const out: number[] = [];
  let s = seed;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 0) % 2147483647;
    out.push((s / 2147483647) * 2 - 1);
  }
  return out;
}

const BLOB_PTS = 32;
const BLOB_SEEDS = seededRands(BLOB_PTS * 2, 137);

export interface UseAboutAnimationProps {
  loaded: boolean;
  imagesRef: React.MutableRefObject<HTMLImageElement[]>;
  containerRef: React.RefObject<HTMLElement | null>;
  heroWrapperRef: React.RefObject<HTMLDivElement | null>;
  katanaWrapperRef: React.RefObject<HTMLDivElement | null>;
  swordUnitRef: React.RefObject<HTMLDivElement | null>;
  bladeTipRef: React.RefObject<HTMLDivElement | null>;
  scrollTextRef: React.RefObject<HTMLSpanElement | null>;
  glimmerRef: React.RefObject<HTMLDivElement | null>;
  bloomRef: React.RefObject<HTMLDivElement | null>;
  preDrawDarknessRef: React.RefObject<HTMLDivElement | null>;
  darkOverlayRef: React.RefObject<HTMLDivElement | null>;
  blobCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  aboutTextRef: React.RefObject<HTMLDivElement | null>;
  photoRef: React.RefObject<HTMLDivElement | null>;
}

export function useAboutAnimation(props: UseAboutAnimationProps) {
  const {
    loaded,
    imagesRef,
    containerRef,
    heroWrapperRef,
    katanaWrapperRef,
    swordUnitRef,
    bladeTipRef,
    scrollTextRef,
    glimmerRef,
    bloomRef,
    preDrawDarknessRef,
    darkOverlayRef,
    blobCanvasRef,
    canvasRef,
    aboutTextRef,
    photoRef,
  } = props;

  const playheadRef = useRef({ frame: 0 });

  useEffect(() => {
    if (!loaded || !containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
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

    // Guard: frame 1 may still be in-flight on real networks
    if (images[0]?.complete && images[0].naturalWidth > 0) {
      render(images[0]);
    } else if (images[0]) {
      images[0].addEventListener('load', () => render(images[0]), { once: true });
    }

    gsap.set(canvas, { opacity: 0 });
    gsap.set(darkOverlayRef.current, { opacity: 0 });
    gsap.set(preDrawDarknessRef.current, { opacity: 0 });
    gsap.set([aboutTextRef.current, photoRef.current], { opacity: 0, y: 30 });
    gsap.set(glimmerRef.current, { opacity: 0, scale: 1 });
    gsap.set(bloomRef.current, { opacity: 0, scale: 0.001 });
    gsap.set(swordUnitRef.current, { y: 0 });

    const blobCanvas = blobCanvasRef.current;
    let blobCtx: CanvasRenderingContext2D | null = null;
    let blobProgress = { v: 0 };

    const resizeBlob = () => {
      if (!blobCanvas) return;
      blobCanvas.width = window.innerWidth;
      blobCanvas.height = window.innerHeight;
    };

    if (blobCanvas) {
      blobCtx = blobCanvas.getContext('2d');
      resizeBlob();
      window.addEventListener('resize', resizeBlob);
    }

    const drawBlob = () => {
      if (!blobCtx || !blobCanvas) return;
      const w = blobCanvas.width;
      const h = blobCanvas.height;
      const p = blobProgress.v;
      const maxR = Math.sqrt(w * w + h * h) / 2 * 1.35;
      const r = maxR * p;

      blobCtx.clearRect(0, 0, w, h);
      if (r <= 0) { blobCanvas.style.opacity = '0'; return; }
      blobCanvas.style.opacity = '1';

      buildBlobPath(blobCtx, w / 2, h / 2, r, BLOB_SEEDS);
      blobCtx.fillStyle = '#FCFCFC';
      blobCtx.fill();
    };

    const gsapCtx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '+=900%',
          scrub: 1,
          pin: true,
        },
      });

      tl.to(katanaWrapperRef.current, { scale: 4, duration: 1.5, ease: 'power2.inOut' }, 0);
      tl.to(scrollTextRef.current, { opacity: 0, duration: 0.3 }, 0);
      tl.to(heroWrapperRef.current, { opacity: 0.06, duration: 1.5, ease: 'power2.inOut' }, 0);
      tl.to(preDrawDarknessRef.current, { opacity: 0.9, duration: 1.0, ease: 'power2.inOut' }, 0.5);

      tl.to(swordUnitRef.current, {
        y: BLADE_DRAW_Y,
        duration: 3,
        ease: 'power4.in',
      }, 'draw');

      tl.add(() => {
        if (!bladeTipRef.current || !glimmerRef.current || !bloomRef.current) return;
        const r = bladeTipRef.current.getBoundingClientRect();
        gsap.set(glimmerRef.current, { left: r.left, top: r.top, xPercent: -50, yPercent: -50 });
        gsap.set(bloomRef.current, { left: r.left, top: r.top, xPercent: -50, yPercent: -50 });
      }, 'glimmer');

      tl.to(glimmerRef.current, { opacity: 1, scale: 1.8, duration: 0.2, ease: 'power2.out' }, 'glimmer');
      tl.to(glimmerRef.current, { opacity: 0, scale: 3, duration: 0.15, ease: 'power2.in' }, 'glimmer+=0.2');
      tl.to(bloomRef.current, { opacity: 1, scale: 12, duration: 0.3, ease: 'power3.out' }, 'glimmer+=0.1');
      tl.to(bloomRef.current, { opacity: 0, duration: 0.5, ease: 'power1.in' }, 'glimmer+=0.4');

      tl.set(katanaWrapperRef.current, { display: 'none' }, 'glimmer+=0.1');
      tl.set(heroWrapperRef.current, { opacity: 0 }, 'glimmer+=0.1');
      tl.set(preDrawDarknessRef.current, { display: 'none' }, 'glimmer+=0.1');

      tl.to(canvas, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, 'glimmer+=0.5');
      tl.to(playheadRef.current, {
        frame: FRAME_COUNT - 1, snap: 'frame', ease: 'none', duration: 6,
        onUpdate: () => {
          const f = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(playheadRef.current.frame)));
          render(images[f]);
        },
      }, 'glimmer+=0.5');
      tl.to(darkOverlayRef.current, { opacity: 0.25, duration: 0.8 }, '-=0.8');
      tl.to(photoRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' });
      tl.to(aboutTextRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '<0.2');

      tl.to(blobProgress, {
        v: 1,
        duration: 1.5,
        ease: 'power2.inOut',
        onUpdate: drawBlob,
      });

    }, containerRef);

    // Force ScrollTrigger to recalculate after this pin is registered
    ScrollTrigger.refresh();

    let resizeTimer: ReturnType<typeof setTimeout>;
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
      window.removeEventListener('resize', resizeBlob);
    };
  }, [loaded, containerRef, canvasRef, blobCanvasRef, imagesRef, heroWrapperRef, katanaWrapperRef, swordUnitRef, bladeTipRef, scrollTextRef, glimmerRef, bloomRef, preDrawDarknessRef, darkOverlayRef, aboutTextRef, photoRef]);
}