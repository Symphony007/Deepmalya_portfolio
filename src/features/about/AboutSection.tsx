import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FRAME_COUNT, aboutFramePath as framePath } from '../../lib/frames';
import { useFrameLoader } from '../../hooks/useFrameLoader';
import { useAboutAnimation } from './hooks/useAboutAnimation';

const EDUCATION_DATA = [
  {
    degree: 'B.Tech in Computer Science and Engineering',
    school: 'BP Poddar Institute of Management and Technology',
    year: '2023 – 2027',
    detail: 'Spanning systems, ML, full stack development and DSA.',
  },
  {
    degree: 'Class XII — CBSE',
    school: 'Barasat Indira Gandhi Memorial High School',
    year: '2021 – 2023',
    detail: 'Specialised in Physics, Chemistry, Mathematics and Computer Science.',
  },
  {
    degree: 'Class X — ICSE',
    school: 'Auxilium Convent School, Barasat',
    year: '2009 – 2021',
    detail: 'Excelled across core disciplines. Active in sports and extracurriculars throughout.',
  },
];

const HANDLE_H  = 76;
const BLADE_H   = 220;

const SOCIALS = [
  {
    label: 'GitHub',
    href: 'https://github.com/Symphony007',
    display: 'Symphony007',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/in/deepmalya-mallick',
    display: 'deepmalya-mallick',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'LeetCode',
    href: 'https://leetcode.com/u/Symphony007',
    display: 'Symphony007',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 shrink-0">
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
      </svg>
    ),
  },
];



export default function AboutSection({ children }: { children: React.ReactNode }) {
  const containerRef       = useRef<HTMLElement>(null);
  const heroWrapperRef     = useRef<HTMLDivElement>(null);

  const katanaWrapperRef   = useRef<HTMLDivElement>(null);
  const swordUnitRef       = useRef<HTMLDivElement>(null);
  const bladeTipRef        = useRef<HTMLDivElement>(null);
  const scrollTextRef      = useRef<HTMLSpanElement>(null);

  const glimmerRef         = useRef<HTMLDivElement>(null);
  const bloomRef           = useRef<HTMLDivElement>(null);

  const preDrawDarknessRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef     = useRef<HTMLDivElement>(null);
  const blobCanvasRef      = useRef<HTMLCanvasElement>(null);
  const canvasRef          = useRef<HTMLCanvasElement>(null);
  const aboutTextRef       = useRef<HTMLDivElement>(null);
  const photoRef           = useRef<HTMLDivElement>(null);

  const [showIndicator, setShow] = useState(false);
  const [showEducation, setShowEducation] = useState(false);

  // Hook 1: Frame Preloading Layer
  const { loaded, imagesRef } = useFrameLoader({
    frameCount: FRAME_COUNT,
    framePath,
    priorityFrames: 40,
    intersectionRef: containerRef,
    rootMargin: '600px 0px',
  });

  // Disable scrolling when modal is open
  useEffect(() => {
    if (showEducation) {
      document.body.style.overflow = 'hidden';
      window.dispatchEvent(new CustomEvent('lenis-stop'));
    } else {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('lenis-start'));
    }
    return () => {
      document.body.style.overflow = '';
      window.dispatchEvent(new CustomEvent('lenis-start'));
    };
  }, [showEducation]);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 4500);
    return () => clearTimeout(t);
  }, []);

  // Hook 2: Animation & Rendering Layer
  useAboutAnimation({
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
  });

  return (
    <section id="about" ref={containerRef} className="relative w-full h-screen bg-black z-20 overflow-hidden">

      {!loaded && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black
                        text-white/50 text-[10px] tracking-[0.3em] font-body uppercase pointer-events-none">
          Loading...
        </div>
      )}

      <div ref={heroWrapperRef} className="absolute inset-0 z-[10] w-full h-full pointer-events-auto">
        {children}
      </div>

      <div ref={preDrawDarknessRef}
           className="absolute inset-0 z-[40] bg-black pointer-events-none" style={{ opacity: 0 }} />

      <div
        ref={glimmerRef}
        className="absolute pointer-events-none"
        style={{
          width:           '4px',
          height:          '4px',
          borderRadius:    '50%',
          zIndex:          68,
          opacity:         0,
          transformOrigin: 'center center',
          background:      '#ffffff',
          boxShadow:       '0 0 6px 3px rgba(255,255,255,0.9), 0 0 16px 8px rgba(255,255,255,0.5), 0 0 30px 15px rgba(255,255,255,0.2)',
        }}
      />

      <div
        ref={bloomRef}
        className="absolute pointer-events-none"
        style={{
          width:           '200px',
          height:          '200px',
          borderRadius:    '50%',
          zIndex:          70,
          opacity:         0,
          transformOrigin: 'center center',
          background:      'radial-gradient(ellipse at center, #ffffff 0%, #ffffff 55%, rgba(255,255,255,0.6) 75%, rgba(255,255,255,0) 100%)',
        }}
      />

      {/* ── KATANA WRAPPER ───────────────────────────────────────────────── */}
      {loaded && (
        <div
          ref={katanaWrapperRef}
          className="absolute left-1/2 z-[60] pointer-events-none"
          style={{
            bottom: '-150px', width: '48px', height: `${HANDLE_H + BLADE_H}px`,
            transform: 'translateX(-50%)',
            transformOrigin: 'center center',
            overflow: 'visible',
            opacity: showIndicator ? 1 : 0,
            transition: 'opacity 1s ease',
          }}
        >
          <span ref={scrollTextRef}
                className="absolute font-body text-[8px] uppercase tracking-[0.5em] text-gold/40"
                style={{ top: '-22px', left: '50%', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>
            scroll
          </span>

          <div ref={swordUnitRef} className="absolute top-0 left-0 w-full"
               style={{ overflow: 'visible', zIndex: 1 }}>

            <div className="absolute top-0 left-0 w-full" style={{ height: `${HANDLE_H}px` }}>
              <svg viewBox="0 0 80 76" className="w-full h-full" fill="none" style={{ overflow: 'visible' }}>
                <rect x="35" y="0"  width="10" height="9"  rx="4.5" fill="#c9a84c" />
                <rect x="36" y="1"  width="8"  height="5"  rx="3"   fill="#ddc05a" opacity="0.45" />
                <rect x="36" y="8"  width="8"  height="45" rx="1"   fill="#1a1208" />
                {[10, 15, 20, 25, 30, 35, 40, 45].map((y) => (
                  <rect key={y} x="35.5" y={y} width="9" height="2" rx="0.5" fill="#c9a84c" opacity="0.7" />
                ))}
                <rect x="36.5" y="8" width="2" height="45" rx="1" fill="#ffffff" opacity="0.04" />
                <ellipse cx="40" cy="57" rx="16"  ry="6"   fill="#c9a84c" />
                <ellipse cx="40" cy="57" rx="14"  ry="5"   fill="#b8922e" />
                <ellipse cx="40" cy="54.5" rx="9" ry="2"   fill="#ddc05a" opacity="0.35" />
                <ellipse cx="40" cy="60"   rx="12" ry="2.5" fill="#8a6820" opacity="0.3" />
                <rect x="18" y="53.5" width="22" height="7"   fill="#c9a84c" />
                <rect x="18" y="54"   width="22" height="5.5" fill="#b8922e" />
                <ellipse cx="18" cy="57" rx="12"  ry="4.5" fill="#c9a84c" />
                <ellipse cx="18" cy="57" rx="10"  ry="3.5" fill="#b8922e" />
                <ellipse cx="18" cy="55.5" rx="6" ry="1.5" fill="#ddc05a" opacity="0.28" />
                <ellipse cx="18" cy="59"   rx="9" ry="2"   fill="#8a6820" opacity="0.25" />
                <rect x="40" y="53.5" width="22" height="7"   fill="#c9a84c" />
                <rect x="40" y="54"   width="22" height="5.5" fill="#b8922e" />
                <ellipse cx="62" cy="57" rx="12"  ry="4.5" fill="#c9a84c" />
                <ellipse cx="62" cy="57" rx="10"  ry="3.5" fill="#b8922e" />
                <ellipse cx="62" cy="55.5" rx="6" ry="1.5" fill="#ddc05a" opacity="0.28" />
                <ellipse cx="62" cy="59"   rx="9" ry="2"   fill="#8a6820" opacity="0.25" />
                <rect x="37" y="51" width="6" height="12" rx="0.5" fill="#050302" />
                <ellipse cx="40" cy="57" rx="16" ry="6" fill="none" stroke="#8a6820" strokeWidth="0.5" opacity="0.5" />
              </svg>
            </div>

            <div className="absolute left-0 w-full" style={{ top: `${HANDLE_H}px`, height: `${BLADE_H}px` }}>
              <svg viewBox="0 0 48 220" className="w-full h-full" fill="none">
                <defs>
                  <linearGradient id="ab-steel" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%"   stopColor="#7c7870" />
                    <stop offset="20%"  stopColor="#bcb8b0" />
                    <stop offset="42%"  stopColor="#e4e0d8" />
                    <stop offset="65%"  stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#a4a09c" />
                  </linearGradient>
                  <linearGradient id="ab-shine" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="transparent" />
                    <stop offset="40%"  stopColor="white"       stopOpacity="0.5" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                  <mask id="ab-mask">
                    <rect x="19" y="0"  width="10" height="14"  fill="white" />
                    <rect x="19" y="14" width="10" height="192" fill="white" />
                    <polygon points="19,206 29,206 24,220"       fill="white" />
                  </mask>
                </defs>
                <rect x="19" y="0"     width="10" height="14" rx="0.5" fill="#c9a84c" />
                <rect x="19.5" y="0.5" width="9"  height="11" rx="0.5" fill="#b8922e" opacity="0.65" />
                <rect x="19.5" y="0.5" width="9"  height="4"  rx="0.5" fill="#ddc05a" opacity="0.35" />
                <rect x="19" y="14" width="10" height="192" fill="url(#ab-steel)" />
                <polygon points="19,206 29,206 24,220"        fill="url(#ab-steel)" />
                <line x1="19" y1="14"  x2="19"  y2="206" stroke="#ffffff" strokeWidth="0.6" opacity="0.9" />
                <line x1="19" y1="206" x2="24"  y2="220" stroke="#ffffff" strokeWidth="0.6" opacity="0.9" />
                <line x1="20" y1="14"  x2="20"  y2="206" stroke="#ffffff" strokeWidth="0.3" opacity="0.35" />
                <line x1="28" y1="14"  x2="28"  y2="206" stroke="#606060" strokeWidth="0.4" opacity="0.5" />
                <line x1="28" y1="206" x2="24"  y2="220" stroke="#606060" strokeWidth="0.4" opacity="0.5" />
                <g mask="url(#ab-mask)">
                  <rect x="0" y="-50" width="48" height="80"
                        fill="url(#ab-shine)"
                        style={{ animation: 'blade-shine 4s linear infinite' }} />
                </g>
              </svg>

              <div
                ref={bladeTipRef}
                className="absolute pointer-events-none"
                style={{
                  left:   `${(19 / 48) * 100}%`,
                  bottom: '0px',
                  width:  '0px',
                  height: '0px',
                }}
              />
            </div>

          </div>

          <div className="absolute left-0 w-full" style={{ top: `${HANDLE_H}px`, height: `${BLADE_H}px`, zIndex: 2 }}>
            <svg viewBox="0 0 48 220" className="w-full h-full" fill="none">
              <rect x="12" y="0" width="24" height="208" fill="#0e0a04" />
              <path d="M 12 208 Q 12 220 24 224 Q 36 220 36 208 Z" fill="#0e0a04" />
              <line x1="12.5" y1="16" x2="12.5" y2="208" stroke="#ffffff" strokeWidth="0.3" opacity="0.05" />
              <line x1="35.5" y1="16" x2="35.5" y2="208" stroke="#000000" strokeWidth="0.6" opacity="0.4" />
              <line x1="24"   y1="16" x2="24"   y2="208" stroke="#1a1408" strokeWidth="0.4" opacity="0.6" />
              <rect x="12" y="0"   width="24" height="18" rx="1.5" fill="#c9a84c" />
              <rect x="13" y="1"   width="22" height="16" rx="1"   fill="#b8922e" />
              <rect x="13" y="1"   width="22" height="6"  rx="1"   fill="#ddc05a" opacity="0.30" />
              <rect x="19" y="2"   width="10" height="14" rx="0"   fill="#050302" />
              <rect x="20" y="12"  width="8"  height="6"  rx="0.5" fill="#000000" opacity="0.6" />
              <rect x="12"   y="64"    width="24"  height="5"   rx="0.5" fill="#c9a84c" opacity="0.8" />
              <rect x="12.5" y="64.5"  width="23"  height="3.5" rx="0.5" fill="#ddc05a" opacity="0.2" />
              <rect x="12"   y="134"   width="24"  height="5"   rx="0.5" fill="#c9a84c" opacity="0.8" />
              <rect x="12.5" y="134.5" width="23"  height="3.5" rx="0.5" fill="#ddc05a" opacity="0.2" />
              <path d="M 12 208 Q 12 222 24 226 Q 36 222 36 208 Z" fill="#c9a84c" />
              <path d="M 13 210 Q 13 220 24 224 Q 35 220 35 210 Z" fill="#b8922e" opacity="0.6" />
              <path d="M 15 212 Q 15 220 24 223" stroke="#ddc05a" strokeWidth="0.4" opacity="0.35" />
            </svg>
          </div>

        </div>
      )}

      <canvas ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full z-[20] pointer-events-none" />

      <div ref={darkOverlayRef}
           className="absolute inset-0 bg-black z-[25] pointer-events-none" style={{ opacity: 0 }} />

      <canvas ref={blobCanvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
              style={{ zIndex: 95, opacity: 0 }} />

      {/* ── About content ────────────────────────────────────────────────────
          UX NOTE: The wrapper below uses pointer-events-none so it doesn't block the canvas.
          Any interactive nested elements MUST explicitly use pointer-events-auto
          in their class list, or they will silently be unclickable!
      ─────────────────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-[30] pointer-events-none flex items-center justify-center">
        <div className="px-16 grid grid-cols-1 md:grid-cols-[auto_1fr] gap-16 items-center" style={{ maxWidth: '860px', width: '100%' }}>

          {/* ── Photo column ────────────────────────────────────────────── */}
          <div ref={photoRef} className="flex flex-col items-start">
            <div className="w-56 h-56 md:w-72 md:h-72 rounded-full border border-gold/40
                            overflow-hidden relative shadow-[0_0_30px_rgba(201,168,76,0.15)] mb-8">
              <img src="/about/pfp_bw.png" alt="Deepmalya Mallick"
                   className="absolute inset-0 w-full h-full object-cover object-center grayscale" />
            </div>



            {/* ── Social links ────────────────────────────────────────── */}
            <div className="flex items-center gap-5">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto flex items-center gap-2 font-body text-[10px] uppercase tracking-[0.2em] text-text-primary/40 hover:text-gold transition-colors duration-300 group"
                >
                  <span className="text-gold/40 group-hover:text-gold transition-colors duration-300">
                    {s.icon}
                  </span>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* ── Text column ─────────────────────────────────────────────── */}
          <div ref={aboutTextRef} className="flex flex-col text-left">
            <h3 className="font-display text-5xl md:text-7xl uppercase tracking-widest text-text-primary mb-2
                           drop-shadow-[0_0_15px_rgba(241,239,241,0.2)]">
              About
            </h3>

            {/* ── Tagline ───────────────────────────────────────────────── */}
            <p className="font-body text-gold text-xl md:text-2xl uppercase tracking-[0.2em] mb-10">
              Driven by problems,<br />not playbooks.
            </p>

            {/* ── Body ──────────────────────────────────────────────────── */}
            <p className="font-body text-sm leading-loose text-text-primary/80 font-light max-w-lg mb-8">
              Third year CS student. I work across ML, systems, full stack and design —
              not because I planned it that way, but because each problem pulled me somewhere new.
              I gravitate toward problems that don't have a tutorial.
              Open to internships in SDE, ML, or design.
            </p>

            {/* ── View Education Button ─────────────────────────────────── */}
            <button
              onClick={() => setShowEducation(true)}
              className="group relative self-start pointer-events-auto flex items-center gap-3 overflow-hidden rounded-full border border-gold/30 bg-gold/5 px-6 py-2.5 transition-all hover:bg-gold/10 hover:border-gold/60"
            >
              <div className="absolute inset-0 w-0 bg-gradient-to-r from-gold/0 via-gold/10 to-gold/0 transition-all duration-700 ease-out group-hover:w-[200%] -translate-x-[50%]" />
              <span className="font-body text-[11px] uppercase tracking-[0.3em] text-[#d4b96b] relative z-10 transition-colors group-hover:text-[#f0e3bc]">
                View Education
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                   className="w-4 h-4 text-gold/60 relative z-10 transition-transform group-hover:translate-x-1 group-hover:text-gold"
                   style={{ strokeLinecap: 'round', strokeLinejoin: 'round' }}>
                <path d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>

      {/* ── Education Modal Popup ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showEducation && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(16px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-8 pointer-events-auto"
            style={{ backgroundColor: 'rgba(5, 5, 5, 0.85)' }}
          >
            {/* Modal Container */}
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -20, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
              className="relative w-full max-w-2xl drop-shadow-[0_30px_60px_rgba(0,0,0,0.9)]"
            >
              {/* Filtered Parchment Background */}
              <div 
                className="absolute inset-0 pointer-events-none z-[5]"
                style={{
                  borderRadius: '16px 4px 14px 6px / 6px 16px 4px 18px',
                  filter: 'url(#nav-roughpaper)',
                  boxShadow: '10px 15px 40px rgba(0,0,0,0.7), inset 0 0 25px rgba(60,25,5,0.7), inset 0 0 10px rgba(20,5,0,0.9)',
                  background: '#c8b698',
                }}
              >
                {/* Cinematic Texture */}
                <div className="absolute inset-0 opacity-80 mix-blend-multiply texture-aged-paper"
                     style={{ borderRadius: 'inherit' }} />
                <div className="absolute inset-0 mix-blend-multiply"
                     style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(90,45,15,0.65) 85%, rgba(40,15,0,0.9) 100%)', borderRadius: 'inherit' }} />
                
                {/* Extra ink stains & wear */}
                <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-[50%] bg-[#5a3010] mix-blend-multiply opacity-30 blur-[20px]" />
                <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[40%] rounded-[50%] bg-[#3a1a05] mix-blend-multiply opacity-40 blur-[25px]" />
                <div className="absolute top-[50%] left-[20%] w-[20%] h-[30%] rounded-[50%] bg-[#1a0f05] opacity-15 mix-blend-multiply blur-[30px]" />
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowEducation(false)}
                className="absolute top-6 right-6 p-2 rounded-full border border-[#3d2b1f]/60 text-[#3d2b1f] hover:text-[#1a110a] hover:border-[#1a110a] hover:bg-[#3d2b1f]/10 transition-all z-20 group"
                aria-label="Close modal"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                     className="w-5 h-5 transition-transform group-hover:rotate-90">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="relative z-[10] p-8 md:p-12 h-full max-h-[85vh] overflow-y-auto custom-modal-scroll">
                <div className="text-center mb-12">
                  <h3 className="font-display text-3xl md:text-4xl uppercase tracking-widest text-[#1a110a] drop-shadow-sm font-bold">
                    Education
                  </h3>
                  <div className="mx-auto w-12 h-px bg-[#3d2b1f]/40 mt-4" />
                </div>

                {/* Minimalist Timeline Line */}
                <div className="relative w-full pl-[5px]">
                  <div className="absolute left-[13px] top-2 bottom-2 w-px bg-gradient-to-b from-transparent via-[#3d2b1f]/40 to-transparent" />

                  <div className="flex flex-col gap-10 md:gap-14">
                    {EDUCATION_DATA.map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 + idx * 0.15, ease: 'easeOut' }}
                        className="relative flex items-start gap-6 md:gap-8"
                      >
                        {/* Golden Node */}
                        <div className="relative z-10 shrink-0 mt-1.5 flex justify-center items-center w-5 h-5">
                          <div className="w-2.5 h-2.5 rounded-sm rotate-45 bg-[#1a110a] shadow-[0_2px_4px_rgba(0,0,0,0.5)]" />
                          <div className="absolute inset-0 border border-[#3d2b1f] rounded-sm scale-150 rotate-45 opacity-40" />
                        </div>

                        {/* Text Block */}
                        <div className="flex flex-col text-left">
                          <h4 className="font-display font-bold uppercase tracking-widest text-[#1a110a]"
                              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', lineHeight: '1.4' }}>
                            {item.degree}
                          </h4>
                          <h5 className="font-body text-[#2c2015] font-semibold tracking-wide mt-2"
                              style={{ fontSize: 'clamp(0.75rem, 1vw, 0.85rem)' }}>
                            {item.school}
                          </h5>
                          <div className="font-display tracking-[0.2em] text-[#3d2b1f] mt-3 border border-[#3d2b1f]/30 bg-[#3d2b1f]/5 px-3 py-1 rounded-sm self-start inline-block font-bold"
                               style={{ fontSize: '10px' }}>
                            {item.year}
                          </div>
                          <p className="font-body text-[#3d2b1f]/90 font-semibold mt-4 max-w-md leading-relaxed"
                             style={{ fontSize: '12px' }}>
                            {item.detail}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-modal-scroll::-webkit-scrollbar { width: 6px; }
        .custom-modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-modal-scroll::-webkit-scrollbar-thumb { background: rgba(26,17,10,0.3); border-radius: 4px; }
        .custom-modal-scroll::-webkit-scrollbar-thumb:hover { background: rgba(26,17,10,0.6); }
      `}</style>
    </section>
  );
}
