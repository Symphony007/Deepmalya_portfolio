import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 141;
const framePath = (i: number) =>
  `/skills/finalbg_frames/frame_${String(i).padStart(4, '0')}.png`;

const ICON_BASE = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

// Custom inline SVG for YOLOv8 (no official devicon exists)
const YOLO_ICON_SVG = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="14" fill="#00BFFF"/>
  <text x="50" y="42" font-family="monospace" font-weight="bold" font-size="22"
        text-anchor="middle" fill="white">YOLO</text>
  <text x="50" y="70" font-family="monospace" font-weight="bold" font-size="22"
        text-anchor="middle" fill="white">v8</text>
</svg>
`)}`;

const SKILLS: { name: string; icon: string }[] = [
  { name: 'React',        icon: `${ICON_BASE}/react/react-original.svg` },
  { name: 'Python',       icon: `${ICON_BASE}/python/python-original.svg` },
  { name: 'TypeScript',   icon: `${ICON_BASE}/typescript/typescript-original.svg` },
  { name: 'PyTorch',      icon: `${ICON_BASE}/pytorch/pytorch-original.svg` },
  { name: 'Node.js',      icon: `${ICON_BASE}/nodejs/nodejs-original.svg` },
  { name: 'Java',         icon: `${ICON_BASE}/java/java-original.svg` },
  { name: 'Figma',        icon: `${ICON_BASE}/figma/figma-original.svg` },
  { name: 'OpenCV',       icon: `${ICON_BASE}/opencv/opencv-original.svg` },
  { name: 'JavaScript',   icon: `${ICON_BASE}/javascript/javascript-original.svg` },
  { name: 'FastAPI',      icon: `${ICON_BASE}/fastapi/fastapi-original.svg` },
  { name: 'Git',          icon: `${ICON_BASE}/git/git-original.svg` },
  { name: 'C',            icon: `${ICON_BASE}/c/c-original.svg` },
  { name: 'NumPy',        icon: `${ICON_BASE}/numpy/numpy-original.svg` },
  { name: 'HTML',         icon: `${ICON_BASE}/html5/html5-original.svg` },
  { name: 'Blender',      icon: `${ICON_BASE}/blender/blender-original.svg` },
  { name: 'scikit-learn', icon: `${ICON_BASE}/scikitlearn/scikitlearn-original.svg` },
  { name: 'CSS',          icon: `${ICON_BASE}/css3/css3-original.svg` },
  { name: 'YOLOv8',       icon: YOLO_ICON_SVG },
  { name: 'Linux',        icon: `${ICON_BASE}/linux/linux-original.svg` },
];

const ANGLE_STEP = 360 / SKILLS.length;
const RADIUS = 340;

// ── Shared card styles ────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  width: '90px',
  height: '110px',
  // Replaced backdrop-filter with a rich translucent gradient to avoid
  // Safari/Chrome 3D AABB rendering artifacts (the "weird split line" bug).
  background: 'linear-gradient(135deg, rgba(35,35,35,0.95), rgba(15,15,15,0.85))',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '12px 8px 10px',
  boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
};

// ── Reusable ring of cards ────────────────────────────────────────────────
function CarouselRing({ isBack }: { isBack?: boolean }) {
  return (
    <div
      className="carousel-ring"
      style={{
        transformStyle: 'preserve-3d',
        animation: 'carouselSpin 25s linear infinite',
      }}
    >
      {SKILLS.map((skill, i) => (
        <div
          key={skill.name}
          style={{
            position: 'absolute',
            transform: `rotateY(${i * ANGLE_STEP}deg) translateZ(${RADIUS}px)`,
            transformStyle: 'preserve-3d',
          }}
        >
          <div
            className="flex flex-col items-center justify-center"
            style={{
              ...cardStyle,
              backfaceVisibility: 'hidden',
              transform: isBack
                ? 'translateX(-50%) translateY(-50%) rotateY(180deg)'
                : 'translateX(-50%) translateY(-50%)',
            }}
          >
            {/* Inner content: scaleX(-1) on back layer to un-mirror text */}
            <div style={isBack ? { transform: 'scaleX(-1)' } : undefined}
                 className="flex flex-col items-center justify-center">
              <img
                src={skill.icon}
                alt={skill.name}
                style={{ width: '36px', height: '36px', objectFit: 'contain', marginBottom: '8px' }}
              />
              <span
                className="font-body font-semibold uppercase text-center leading-tight"
                style={{ fontSize: '10px', letterSpacing: '0.05em', color: '#f0f0f0' }}
              >
                {skill.name}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Shared ring wrapper styles ────────────────────────────────────────────
const ringWrapperBase: React.CSSProperties = {
  perspective: '1200px',
  opacity: 0,
  visibility: 'hidden' as const,
};

export default function SkillsSection() {
  const sectionRef  = useRef<HTMLElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const samuraiRef  = useRef<HTMLDivElement>(null);
  const headingRef  = useRef<HTMLDivElement>(null);
  const frontRingRef = useRef<HTMLDivElement>(null);
  const backRingRef  = useRef<HTMLDivElement>(null);
  const imagesRef   = useRef<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Kept in a ref so the resize handler reads the latest value
  const playheadRef = useRef({ frame: 0 });

  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    let n = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = framePath(i);
      img.onload = () => { if (++n === FRAME_COUNT) setLoaded(true); };
      imgs.push(img);
    }
    imagesRef.current = imgs;
  }, []);

  useEffect(() => {
    if (!loaded) return;
    const section = sectionRef.current;
    const canvas  = canvasRef.current;
    if (!section || !canvas) return;

    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const images = imagesRef.current;

    const render = (img: HTMLImageElement) => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const ratio = Math.max(canvas.width / img.width, canvas.height / img.height);
      const cx = (canvas.width  - img.width  * ratio) / 2;
      const cy = (canvas.height - img.height * ratio) / 2;
      ctx2d.imageSmoothingEnabled = true;
      ctx2d.imageSmoothingQuality = 'high';
      ctx2d.clearRect(0, 0, canvas.width, canvas.height);
      ctx2d.drawImage(img, 0, 0, img.width, img.height, cx, cy, img.width * ratio, img.height * ratio);
    };
    render(images[0]);

    // Wait until after App.tsx's ScrollTrigger.refresh() fires (1200ms) before
    // registering this section's ScrollTrigger, so pin spacers are measured correctly.
    const setupTimer = setTimeout(() => {
      gsap.set(samuraiRef.current,   { yPercent: 100, opacity: 0 });
      gsap.set(frontRingRef.current, { opacity: 0, visibility: 'hidden' });
      gsap.set(backRingRef.current,  { opacity: 0, visibility: 'hidden' });

      const gsapCtx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start:   'top top',
            end:     '+=600%',
            scrub:   1,
            pin:     true,
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
        tl.to(frontRingRef.current,  { opacity: 1, duration: 0.1, ease: 'none' }, 9.9);
        tl.set(backRingRef.current,  { visibility: 'visible' }, 9.9);
        tl.to(backRingRef.current,   { opacity: 1, duration: 0.1, ease: 'none' }, 9.9);

        // Hold-frame buffer before ProjectsSection unpin begins
        tl.to({}, { duration: 3.5 });
      }, section);

      const onResize = () => {
        const f = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(playheadRef.current.frame)));
        render(images[f]);
      };
      window.addEventListener('resize', onResize);

      // Store teardown on the section element for cleanup below
      (section as any).__skillsCleanup = () => {
        gsapCtx.revert();
        window.removeEventListener('resize', onResize);
      };
    }, 10); // Run early so App.tsx can capture the target

    return () => {
      clearTimeout(setupTimer);
      const cleanup = (section as any).__skillsCleanup;
      if (cleanup) cleanup();
    };
  }, [loaded]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: '#FCFCFC' }}
    >
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

      {/* Skills heading */}
      <div
        ref={headingRef}
        className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
        style={{ zIndex: 10 }}
      >
        <h3 className="font-display text-5xl md:text-7xl uppercase tracking-widest text-black mb-2 drop-shadow-sm">
          Skills
        </h3>
        <p className="font-body text-gold text-xl md:text-2xl uppercase tracking-[0.2em]">
          Technologies I have worked with
        </p>
      </div>

      {/* ─── BACK ring — behind the samurai ─────────────────────────────── */}
      <div
        ref={backRingRef}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ ...ringWrapperBase, bottom: '40%', zIndex: 4 }}
      >
        <CarouselRing isBack />
      </div>

      {/* ─── SAMURAI — middle layer ─────────────────────────────────────── */}
      <div
        ref={samuraiRef}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ zIndex: 6, width: '50vw', maxWidth: '600px', opacity: 0 }}
      >
        <img
          src="/skills/samurai_outline.png"
          alt="Samurai silhouette"
          className="w-full h-auto"
        />
      </div>

      {/* ─── FRONT ring — in front of the samurai ───────────────────────── */}
      <div
        ref={frontRingRef}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ ...ringWrapperBase, bottom: '40%', zIndex: 8 }}
      >
        <CarouselRing />
      </div>

      <style>{`
        @keyframes carouselSpin {
          from { transform: rotateX(-12deg) rotateY(0deg); }
          to   { transform: rotateX(-12deg) rotateY(360deg); }
        }
      `}</style>
    </section>
  );
}