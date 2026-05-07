import React, { useRef } from 'react';
import { FRAME_COUNT, skillsFramePath as framePath } from '../../lib/frames';
import { useFrameLoader } from '../../hooks/useFrameLoader';
import { useSkillsAnimation } from './hooks/useSkillsAnimation';

const ICON_BASE = '/icons';

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

const cardStyle: React.CSSProperties = {
  width: '90px',
  height: '110px',
  background: 'linear-gradient(135deg, rgba(35,35,35,0.95), rgba(15,15,15,0.85))',
  border: '1px solid rgba(255,255,255,0.12)',
  borderRadius: '12px',
  padding: '12px 8px 10px',
  boxShadow: '0 6px 24px rgba(0,0,0,0.5)',
};

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
            className="flex flex-col items-center justify-center pointer-events-auto transition-transform duration-300 hover:scale-[1.15] hover:-translate-y-2 cursor-pointer"
            style={{
              ...cardStyle,
              backfaceVisibility: 'hidden',
              transform: isBack
                ? 'translateX(-50%) translateY(-50%) rotateY(180deg)'
                : 'translateX(-50%) translateY(-50%)',
            }}
          >
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

const ringWrapperBase: React.CSSProperties = {
  perspective: '1200px',
  opacity: 0,
  visibility: 'hidden' as const,
};

export default function SkillsSection() {
  const sectionRef   = useRef<HTMLElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const samuraiRef   = useRef<HTMLDivElement>(null);
  const headingRef   = useRef<HTMLDivElement>(null);
  const frontRingRef = useRef<HTMLDivElement>(null);
  const backRingRef  = useRef<HTMLDivElement>(null);

  const { loaded, imagesRef } = useFrameLoader({
    frameCount: FRAME_COUNT,
    framePath,
    priorityFrames: 20,
    // NOTE: intentionally omitting intersectionRef here.
    // The About section's GSAP pin spacer (~900vh) pushes Skills far down
    // the page before the IntersectionObserver's first async callback fires,
    // causing it to see the section as out-of-range and never trigger loading.
    // Eager loading avoids this race condition entirely.
  });

  useSkillsAnimation({
    loaded,
    imagesRef,
    sectionRef,
    canvasRef,
    samuraiRef,
    headingRef,
    frontRingRef,
    backRingRef,
  });

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full h-screen overflow-hidden"
      style={{ backgroundColor: '#FCFCFC' }}
    >
      {!loaded && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#FCFCFC]
                        text-black/40 text-[10px] tracking-[0.3em] font-body uppercase pointer-events-none">
          Loading 3D Engine...
        </div>
      )}

      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
        style={{ zIndex: 0 }}
      />

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

      <div
        ref={backRingRef}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ ...ringWrapperBase, bottom: '40%', zIndex: 4 }}
      >
        <CarouselRing isBack />
      </div>

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

      <div
        ref={frontRingRef}
        className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
        style={{ ...ringWrapperBase, bottom: '40%', zIndex: 8 }}
      >
        <CarouselRing />
      </div>

      {/* carouselSpin keyframes and hover-pause rule moved to index.css */}
    </section>
  );
}