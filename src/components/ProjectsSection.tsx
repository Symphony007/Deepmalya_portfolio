import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/* ─── Project data ───────────────────────────────────────────────────────── */
const MOCK_PROJECTS = [
  {
    title: 'AEGIS',
    image: '/projects/aegis_mockup.png',
    link: 'https://github.com/Symphony007/SIH_Drone_Algo',
    desc: 'Multi-agent simulation with a decentralised swarm defence algorithm and adversarial reinforcement learning. Four class-specific PPO policies co-evolve over 1,000 generations to breach a hand-crafted heuristic defence across four contested airspace scenarios.',
  },
  {
    title: 'Weave',
    image: '/projects/weave_mockup.png',
    link: 'https://github.com/Symphony007/Weave---VirtualDOM',
    desc: 'Renderer-agnostic Virtual DOM reconciler built from scratch in TypeScript. Zero dependencies, keyed diffing, lifecycle hooks, and a swappable HostConfig that retargets the engine to any platform. Ships with a live metrics dashboard built entirely on Weave itself.',
  },
  {
    title: 'Scry',
    image: '/projects/scry_mockup.png',
    link: 'https://github.com/Symphony007/scry',
    liveLink: 'https://scry-8hcq.onrender.com/',
    desc: 'Full-stack steganography engine with four embedding methods and a parallel statistical detection pipeline. A Random Forest image classifier runs type-aware weight adjustment in production on every request. Deployed on Render with a FastAPI backend and React + Vite frontend.',
  },
  {
    title: 'Fruit Ninja Bot',
    image: '/projects/fruit_ninja_mockup.png',
    link: 'https://github.com/Symphony007/fruit-ninja-bot',
    desc: 'Real-time CV automation bot with custom-trained YOLOv8 detection, Hungarian-style multi-object tracking, and physics-based trajectory prediction. Runs a 60 FPS processing loop with bomb avoidance and 150ms latency compensation.',
  },
];

/* ─── Smooth ease shared by door and unroll phases ──────────────────────── */
// cubic ease-in-out: same curve used for scroll position interpolation
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/* ─── Wood roller ────────────────────────────────────────────────────────── */
function WoodRoller({ flip }: { flip?: boolean }) {
  const grad = flip
    ? 'linear-gradient(to top, #1a110b 0%, #3a271b 20%, #70543e 50%, #4a3424 80%, #2b1d14 100%)'
    : 'linear-gradient(to bottom, #2b1d14 0%, #4a3424 20%, #70543e 50%, #3a271b 80%, #1a110b 100%)';
  const hi = flip ? '70%' : '30%';

  return (
    <div
      className="w-[104%] h-7 md:h-10 relative z-30 flex items-center justify-between shrink-0"
      style={{
        background: grad,
        borderTop:    flip ? '2px solid #000' : '1px solid rgba(255,255,255,0.1)',
        borderBottom: flip ? '1px solid rgba(255,255,255,0.05)' : '2px solid #000',
        boxShadow: flip
          ? '0 -5px 15px rgba(0,0,0,0.5), 0 12px 30px rgba(0,0,0,0.9)'
          : '0 12px 20px rgba(0,0,0,0.9)',
        clipPath: 'polygon(0.8% 2%, 99.2% 0%, 100% 48%, 98.7% 95%, 1.2% 100%, 0% 55%)',
      }}
    >
      <div className="roller-tex absolute inset-0 opacity-40 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]" />

      {/* Deep scratches & splinters */}
      <div className="roller-tex absolute inset-0 opacity-40 mix-blend-color-burn" style={{
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.95) 10px, rgba(0,0,0,0.95) 12px, transparent 12px, transparent 25px, rgba(0,0,0,0.8) 25px, rgba(0,0,0,0.8) 26px)',
      }} />

      {/* left knob */}
      <div
        className="w-4 h-10 md:w-6 md:h-14 -ml-3 md:-ml-4 rounded-full border border-[#8a6820]/30 z-10"
        style={{
          background: `radial-gradient(ellipse at 30% ${hi}, #a68444 0%, #6e5225 40%, #2f220d 100%)`,
          boxShadow: '-4px 0 10px rgba(0,0,0,0.8)',
          clipPath: 'polygon(10% 5%, 95% 0, 100% 100%, 0 92%)',
        }}
      />
      {/* right knob */}
      <div
        className="w-4 h-10 md:w-6 md:h-14 -mr-3 md:-mr-4 rounded-full border border-[#8a6820]/30 z-10"
        style={{
          background: `radial-gradient(ellipse at 70% ${hi}, #a68444 0%, #6e5225 40%, #2f220d 100%)`,
          boxShadow: '4px 0 10px rgba(0,0,0,0.8)',
          clipPath: 'polygon(5% 0, 90% 10%, 100% 90%, 0 100%)',
        }}
      />
    </div>
  );
}

/* ─── Main component ─────────────────────────────────────────────────────── */
export default function ProjectsSection() {
  const wrapRef       = useRef<HTMLElement>(null);
  const paperRef      = useRef<HTMLDivElement>(null);
  const contentRef    = useRef<HTMLDivElement>(null);
  const botRef        = useRef<HTMLDivElement>(null);
  const leftDoorRef   = useRef<HTMLDivElement>(null);
  const rightDoorRef  = useRef<HTMLDivElement>(null);
  const scrollWrapRef = useRef<HTMLDivElement>(null);
  const innerWrapRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap    = wrapRef.current;
    const paper   = paperRef.current;
    const content = contentRef.current;
    if (!wrap || !paper || !content) return;

    // Dummy ScrollTrigger so App.tsx correctly calculates the offset of #projects
    const dummyCtx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: wrap,
        start: 'top top',
      });
    });

    const ROLLED_H = 140;
    const vh = window.innerHeight;
    const OPEN_H = vh * 0.76;

    paper.style.height = `${ROLLED_H}px`;
    content.style.transform = 'translateY(0)';

    const onScroll = () => {
      const rect      = wrap.getBoundingClientRect();
      const wrapH     = wrap.offsetHeight;
      const scrollRange = wrapH - vh;
      const scrolled  = -rect.top;

      // ── Off-screen above ───────────────────────────────────────────────
      if (scrolled < -vh) {
        if (innerWrapRef.current) {
          innerWrapRef.current.style.transform = 'translateY(-200%)';
          innerWrapRef.current.style.opacity   = '0';
        }
        paper.style.height = `${ROLLED_H}px`;
        content.style.transform = 'translateY(0)';
        return;
      }

      // ── Off-screen below — enforce fully-open final state ─────────────
      if (scrolled > scrollRange) {
        if (innerWrapRef.current) innerWrapRef.current.style.transform = 'translateY(0%)';
        if (leftDoorRef.current  && rightDoorRef.current) {
          leftDoorRef.current.style.transform  = 'translateX(-100%)';
          rightDoorRef.current.style.transform = 'translateX(100%)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity   = '1';
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
          innerWrapRef.current.style.opacity   = '1';
          innerWrapRef.current.style.transform = `translateY(${-200 + tDrop * 200}%)`;
        }
        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform  = 'translateX(0%)';
          rightDoorRef.current.style.transform = 'translateX(0%)';
          leftDoorRef.current.style.boxShadow  = 'inset 0 0 30px rgba(0,0,0,0.8)';
          rightDoorRef.current.style.boxShadow = 'inset 0 0 30px rgba(0,0,0,0.8)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity   = '0';
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
          leftDoorRef.current.style.transform  = `translateX(${-t * 100}%)`;
          rightDoorRef.current.style.transform = `translateX(${t * 100}%)`;
          leftDoorRef.current.style.boxShadow  = `10px 0 ${15 + t * 40}px rgba(0,0,0,${0.3 + t * 0.4})`;
          rightDoorRef.current.style.boxShadow = `-10px 0 ${15 + t * 40}px rgba(0,0,0,${0.3 + t * 0.4})`;
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity   = t < 0.1 ? '0' : String(Math.min(1, (t - 0.1) * 2));
          scrollWrapRef.current.style.transform = `scale(${0.96 + t * 0.04})`;
        }
        paper.style.height = `${ROLLED_H}px`;
        content.style.transform = 'translateY(0)';
      }

      // ── PHASE 2 (25% – 50%): Scroll unrolls downward ──────────────────
      else if (progress <= 0.5) {
        if (leftDoorRef.current && rightDoorRef.current) {
          leftDoorRef.current.style.transform  = 'translateX(-100%)';
          rightDoorRef.current.style.transform = 'translateX(100%)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity   = '1';
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
          leftDoorRef.current.style.transform  = 'translateX(-100%)';
          rightDoorRef.current.style.transform = 'translateX(100%)';
        }
        if (scrollWrapRef.current) {
          scrollWrapRef.current.style.opacity   = '1';
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

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // fire once in case already in view

    return () => {
      window.removeEventListener('scroll', onScroll);
      dummyCtx.revert();
    };
  }, []);

  return (
    <section
      ref={wrapRef}
      id="projects"
      className="relative w-full"
      style={{ height: '450vh', marginTop: '-100vh', zIndex: 50 }}
    >
      {/* ── sticky viewport wrapper ────────────────────────────────────────── */}
      <div
        ref={innerWrapRef}
        className="sticky top-0 left-0 w-full overflow-hidden will-change-transform bg-[#0a0806]"
        style={{ height: '100vh', transform: 'translateY(-200%)' }}
      >
        {/* ── Shoji Doors Overlay ──────────────────────────────────────────── */}
        <div
          className="absolute inset-0 z-[60] flex pointer-events-none overflow-hidden"
          style={{ perspective: '1000px' }}
        >
          {/* Left Door */}
          <div ref={leftDoorRef} className="w-1/2 h-full relative"
            style={{ willChange: 'transform, box-shadow', transformOrigin: 'left center' }}
          >
            <div className="absolute inset-0 z-20 border-[16px] border-[#160f09] border-r-[28px] pointer-events-none"
                 style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }} />
            <div className="absolute inset-0 z-10 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(to right,  transparent, transparent 4vw, rgba(22,15,9,0.95) 4vw, rgba(22,15,9,0.95) 4.3vw),
                  repeating-linear-gradient(to bottom, transparent, transparent 10vh, rgba(22,15,9,0.95) 10vh, rgba(22,15,9,0.95) 10.5vh)
                `,
                filter: 'drop-shadow(3px 5px 4px rgba(0,0,0,0.6))',
              }}
            />
            <div className="absolute inset-0 z-0 bg-[#e3d5c1]"
              style={{ boxShadow: 'inset 0 0 80px rgba(80,60,30,0.4)' }}
            >
              <div className="absolute inset-0 opacity-50 mix-blend-multiply texture-aged-paper" />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 100% 50%, rgba(255,245,220,0.1) 0%, transparent 60%)' }} />
            </div>
          </div>

          {/* Right Door */}
          <div ref={rightDoorRef} className="w-1/2 h-full relative"
            style={{ willChange: 'transform, box-shadow', transformOrigin: 'right center' }}
          >
            <div className="absolute inset-0 z-20 border-[16px] border-[#160f09] border-l-[28px] pointer-events-none"
                 style={{ boxShadow: 'inset 0 0 30px rgba(0,0,0,0.8)' }} />
            <div className="absolute inset-0 z-10 pointer-events-none"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(to right,  transparent, transparent 4vw, rgba(22,15,9,0.95) 4vw, rgba(22,15,9,0.95) 4.3vw),
                  repeating-linear-gradient(to bottom, transparent, transparent 10vh, rgba(22,15,9,0.95) 10vh, rgba(22,15,9,0.95) 10.5vh)
                `,
                filter: 'drop-shadow(-3px 5px 4px rgba(0,0,0,0.6))',
              }}
            />
            <div className="absolute inset-0 z-0 bg-[#e3d5c1]"
              style={{ boxShadow: 'inset 0 0 80px rgba(80,60,30,0.4)' }}
            >
              <div className="absolute inset-0 opacity-50 mix-blend-multiply texture-aged-paper" />
              <div className="absolute inset-0"
                style={{ background: 'radial-gradient(circle at 0% 50%, rgba(255,245,220,0.1) 0%, transparent 60%)' }} />
            </div>
          </div>
        </div>

        {/* Background */}
        <img
          src="/projects/projects_bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
          style={{ opacity: 0.75 }}
        />
        <div className="absolute inset-0 bg-black/55 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 20%, black 100%)' }} />

        {/* SVG paper-tear filter */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <filter id="roughpaper" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.04 0.15" numOctaves="5" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>

        {/* ── Scroll centred layout ─────────────────────────────────────────── */}
        <div
          ref={scrollWrapRef}
          className="relative z-10 w-full h-full flex items-start justify-center opacity-0"
          style={{ paddingTop: '7vh', willChange: 'opacity' }}
        >
          <div className="w-[92%] max-w-4xl flex flex-col items-center">

            {/* Top roller */}
            <WoodRoller />

            {/* Parchment */}
            <div
              ref={paperRef}
              className="w-[98%] relative overflow-hidden"
              style={{ height: 140 }}
            >
              {/* Aged paper texture */}
              <div
                className="absolute inset-0"
                style={{ background: '#c2b092', filter: 'url(#roughpaper)' }}
              >
                <div className="absolute inset-0 opacity-60 mix-blend-multiply texture-aged-paper" />
                <div className="absolute inset-0 mix-blend-multiply"
                  style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(60,30,10,0.6) 80%, rgba(20,10,0,0.95) 100%)' }} />
                <div className="absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 120px rgba(80,30,5,0.75), inset 0 0 40px rgba(40,10,0,0.95)' }} />
                {/* Ink / water stains */}
                <div className="absolute top-[10%] left-[5%] w-[30vw] h-[30vw] rounded-full bg-[#3a200a] opacity-[0.15] mix-blend-multiply blur-[60px] pointer-events-none" />
                <div className="absolute bottom-[20%] right-[3%] w-[40vw] h-[40vw] rounded-[40%] bg-[#1a0f05] opacity-20 mix-blend-multiply blur-[80px] pointer-events-none" />
                <div className="absolute top-[45%] left-[-10%] w-[35vw] h-[20vw] rounded-[50%] bg-[#2c1808] opacity-[0.25] mix-blend-multiply blur-[50px] pointer-events-none" />
                <div className="absolute top-[80%] left-[40%] w-[20vw] h-[15vw] rounded-full bg-[#180a02] opacity-20 mix-blend-orange blur-[40px] pointer-events-none" />
              </div>

              {/* Content — GSAP slides this upward */}
              <div
                ref={contentRef}
                className="absolute top-0 left-0 w-full flex flex-col items-center"
                style={{ padding: '32px 48px' }}
              >
                <div className="text-center flex flex-col items-center" style={{ marginBottom: '24px' }}>
                  <h3
                    className="font-display uppercase tracking-widest drop-shadow-sm"
                    style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', color: '#1a1208' }}
                  >
                    Projects
                  </h3>
                  <div style={{ width: 64, height: 2, background: 'rgba(26,18,8,0.5)', marginTop: 16 }} />
                </div>

                <div className="w-full flex flex-col" style={{ gap: '7rem', marginTop: '5rem' }}>
                  {MOCK_PROJECTS.map((proj, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col ${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} items-center group`}
                      style={{ gap: '3rem' }}
                    >
                      {/* Image swatch */}
                      <div
                        className="w-full md:w-1/2 relative overflow-hidden"
                        style={{
                          height: 260,
                          border: '2px solid rgba(26,18,8,0.2)',
                          borderRadius: 2,
                          boxShadow: '0 15px 40px rgba(0,0,0,0.4)',
                        }}
                      >
                        <img
                          src={proj.image}
                          alt={proj.title}
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{
                            filter: 'grayscale(0.8) sepia(0.4) contrast(1.15)',
                            mixBlendMode: 'multiply',
                            opacity: 0.9,
                          }}
                        />
                      </div>

                      {/* Text */}
                      <div className="w-full md:w-1/2 flex flex-col text-left">
                        <h4
                          className="font-display uppercase drop-shadow-sm font-bold"
                          style={{
                            fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                            letterSpacing: '0.12em',
                            color: '#1a1208',
                            marginBottom: 16,
                            lineHeight: 1.1,
                          }}
                        >
                          {proj.title}
                        </h4>
                        <p
                          className="font-body"
                          style={{ fontSize: 13, lineHeight: 1.9, color: '#2c2015', fontWeight: 600, maxWidth: 480 }}
                        >
                          {proj.desc}
                        </p>
                        <div style={{ marginTop: 32, display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                          <a
                            href={proj.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-body inline-block rounded-full border-[1.5px] border-[#1a1208] text-[#1a1208] transition-all duration-300 hover:bg-[#1a1208] hover:border-[#1a1208] hover:!text-[#ddd0b5]"
                            style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '10px 28px', fontWeight: 700 }}
                          >
                            View Repository
                          </a>
                          {proj.liveLink && (
                            <a
                              href={proj.liveLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-body inline-block rounded-full border-[1.5px] border-[#1a1208] text-[#1a1208] transition-all duration-300 hover:bg-[#1a1208] hover:border-[#1a1208] hover:!text-[#ddd0b5]"
                              style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', padding: '10px 28px', fontWeight: 700 }}
                            >
                              Live Project
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ height: 40 }} />
              </div>
            </div>

            {/* Bottom roller */}
            <div ref={botRef} className="w-full">
              <WoodRoller flip />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}