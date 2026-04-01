import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import AboutSection from './features/about/AboutSection';
import SkillsSection from './features/skills/SkillsSection';
import ProjectsSection from './features/projects/ProjectsSection';
import ContactSection from './features/contact/ContactSection';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = [
  { label: 'Home',      id: 'home' },
  { label: 'About',     id: 'about' },
  { label: 'Skills',    id: 'skills' },
  { label: 'Projects',  id: 'projects' },
  { label: 'Contact',   id: 'contact' },
];

const NAV_ITEMS = SECTIONS.slice(1);

export default function App() {
  const [showMenu,      setShowMenu]      = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [navOpen,       setNavOpen]       = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [videoStarted,  setVideoStarted]  = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const lenisRef = useRef<Lenis | null>(null);

  // scrollTargets holds the ACTUAL scroll pixel position for each section
  // after GSAP pin spacers have been inserted into the DOM.
  const scrollTargetsRef = useRef<Record<string, number>>({});


  // ── Lenis + GSAP + compute scroll targets after refresh ─────────────────
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 1.5;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Listen for GSAP's own refresh-complete event instead of guessing
    // with setTimeout. This fires after ALL ScrollTriggers (including
    // child components) have fully computed their pin spacers.
    const onRefreshComplete = () => {
      const targets: Record<string, number> = { home: 0 };
      const allTriggers = ScrollTrigger.getAll();

      const getTriggerFor = (id: string) =>
        allTriggers.find((t) => t.trigger === document.getElementById(id));

      const aboutTrigger    = getTriggerFor('about');
      const skillsTrigger   = getTriggerFor('skills');
      const projectsTrigger = getTriggerFor('projects');

      if (aboutTrigger) {
        const pinLength = aboutTrigger.end - aboutTrigger.start;
        // About content (photo + text) becomes visible ~63% through
        // the AboutSection pin — this ratio is timeline-derived, not
        // screen-derived, so it holds on any screen size.
        targets['about'] = aboutTrigger.start + pinLength * 0.63;
      }
      if (skillsTrigger) {
        // Skills heading is centred on entry — land just past the start
        // so the section title is already visible when nav fires.
        const pinLength = skillsTrigger.end - skillsTrigger.start;
        targets['skills'] = skillsTrigger.start + pinLength * 0.02;
      }
      if (projectsTrigger) {
        targets['projects'] = projectsTrigger.start;
      } else {
        const pEl = document.getElementById('projects');
        if (pEl) targets['projects'] = pEl.getBoundingClientRect().top + window.scrollY;
      }

      const cEl = document.getElementById('contact');
      if (cEl) {
        targets['contact'] = cEl.getBoundingClientRect().top + window.scrollY;
      }

      scrollTargetsRef.current = targets;
    };

    ScrollTrigger.addEventListener('refresh', onRefreshComplete);
    ScrollTrigger.refresh();

    const stopLenis = () => lenis.stop();
    const startLenis = () => lenis.start();
    window.addEventListener('lenis-stop', stopLenis);
    window.addEventListener('lenis-start', startLenis);

    return () => {
      ScrollTrigger.removeEventListener('refresh', onRefreshComplete);
      window.removeEventListener('lenis-stop', stopLenis);
      window.removeEventListener('lenis-start', startLenis);
      lenis.destroy();
    };
  }, []);

  // ── Track active section using pre-computed targets ───────────────────────
  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const targets = scrollTargetsRef.current;

      setShowNavigator(scrollY > vh * 0.8);
      if (navOpen) setNavOpen(false);

      let active = 'home';
      const order = ['home', 'about', 'skills', 'projects', 'contact'];
      for (const id of order) {
        const t = targets[id] ?? 0;
        if (scrollY >= t - vh * 0.4) active = id;
      }
      setActiveSection(active);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [navOpen]);

  // ── Scroll to section using pre-computed pixel targets ───────────────────
  const scrollTo = (id: string) => {
    setNavOpen(false);
    const target = scrollTargetsRef.current[id] ?? 0;
    lenisRef.current?.scrollTo(target, { immediate: true });
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    scrollTo(id);
  };

  return (
    <div className="bg-white w-full min-h-screen">
      <AboutSection>
        <div id="home" className="relative h-screen w-full bg-white flex flex-col items-center justify-center overflow-hidden text-text-primary">

          {/* Background Video */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            poster="/hero/poster.jpg"
            onPlay={() => {
              setVideoStarted(true);
              setTimeout(() => setShowMenu(true), 2000);
            }}
            className="absolute top-0 left-0 w-full h-full object-cover z-0"
          >
            <source src="/hero/smokevapor.mp4" type="video/mp4" />
          </video>

          {/* ── Navbar ────────────────────────────────────────────────── */}
          <nav className="fixed top-0 left-0 w-full z-50 flex justify-center py-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={showMenu ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="flex items-center gap-8"
            >
              {NAV_ITEMS.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => handleNavClick(e, item.id)}
                  className="group relative font-body text-[10px] uppercase tracking-[0.3em] text-text-primary/60 transition-colors hover:text-text-primary"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-[1px] w-0 bg-gold transition-all duration-300 group-hover:w-full" />
                </a>
              ))}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-4 rounded-full border border-gold px-6 py-2 font-body text-[10px] uppercase tracking-[0.3em] text-text-primary transition-all duration-300 hover:bg-gold hover:text-black"
              >
                Resume
              </a>
            </motion.div>
          </nav>

          {/* ── Hero Content ──────────────────────────────────────────── */}
          <main className="relative z-10 flex flex-col items-center text-center px-4">

            <motion.span
              initial={{ opacity: 0, letterSpacing: '0.6em' }}
              animate={videoStarted ? { opacity: 1, letterSpacing: '0.45em' } : { opacity: 0, letterSpacing: '0.6em' }}
              transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              className="font-body text-[10px] md:text-[11px] uppercase mb-6 text-gold/70 tracking-[0.45em] flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                   className="w-3 h-3 shrink-0"
                   style={{ strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }}>
                <path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              Kolkata, India
            </motion.span>

            <div className="flex flex-col items-center leading-none">
              <motion.h1
                initial={{ opacity: 0 }}
                animate={videoStarted ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="font-display text-[14vw] md:text-[130px] leading-[0.9] tracking-widest text-text-primary drop-shadow-[0_0_15px_rgba(241,239,241,0.1)]"
              >
                DEEPMALYA
              </motion.h1>
              <motion.span
                initial={{ opacity: 0 }}
                animate={videoStarted ? { opacity: 1 } : { opacity: 0 }}
                transition={{ duration: 1.2, delay: 0.6, ease: 'easeOut' }}
                className="font-display uppercase text-gold/80 text-center"
                style={{ fontSize: 'clamp(1.6rem, 5vw, 52px)', letterSpacing: '0.55em' }}
              >
                MALLICK
              </motion.span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={videoStarted ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 1, delay: 1.8 }}
              className="flex flex-wrap justify-center gap-4 md:gap-6 font-body text-[11px] md:text-[13px] font-medium uppercase tracking-[0.2em] text-text-primary/40 mt-10"
            >
              <span>Full Stack</span>
              <span className="text-gold/30">·</span>
              <span>Machine Learning</span>
              <span className="text-gold/30">·</span>
              <span>Design</span>
            </motion.div>
          </main>

        </div>
      </AboutSection>

      <SkillsSection />
      <ProjectsSection />
      <ContactSection />

      {/* ── Global SVG Filter for side-panel rough edges ───────────────── */}
      <svg className="absolute w-0 h-0" aria-hidden="true">
        <filter id="nav-roughpaper" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.2" numOctaves="4" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </svg>

      {/* ── Floating section navigator ─────────────────────────────────────
          Appears after scrolling past the landing page.
          Collapsed: a pulsing gold dot.
          Expanded: frosted panel with all sections + active indicator.
      ──────────────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showNavigator && (
          <motion.div
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="fixed bottom-10 right-8 z-[200] flex flex-col items-end gap-2"
          >
            {/* Expanded list */}
            <AnimatePresence>
              {navOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="relative flex flex-col items-end gap-0.5 mb-2 py-3.5 px-5"
                >
                  {/* Parchment Background Scrap */}
                  <div
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{
                      borderRadius: '16px 4px 14px 6px / 6px 16px 4px 18px',
                      filter: 'url(#nav-roughpaper)',
                      boxShadow: '4px 6px 20px rgba(0,0,0,0.6), inset 0 0 15px rgba(60,25,5,0.8), inset 0 0 5px rgba(20,5,0,0.9)',
                      background: '#c8b698',
                    }}
                  >
                    <div className="absolute inset-0 mix-blend-multiply opacity-80 texture-aged-paper" />
                    <div className="absolute inset-0 mix-blend-multiply"
                         style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(90,45,15,0.65) 85%, rgba(40,15,0,0.9) 100%)' }} />
                    {/* Extra stains & wear */}
                    <div className="absolute top-[10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#5a3010] mix-blend-multiply opacity-20 blur-[10px]" />
                    <div className="absolute bottom-[-10%] right-[-5%] w-[60%] h-[40%] rounded-full bg-[#3a1a05] mix-blend-multiply opacity-30 blur-[12px]" />
                  </div>

                  {SECTIONS.map((s, i) => (
                    <motion.button
                      key={s.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => scrollTo(s.id)}
                      className="relative z-10 group flex items-center gap-3 py-1.5 w-full justify-end"
                    >
                      <span className={`font-body font-bold text-[9px] uppercase tracking-[0.3em] transition-all duration-200 ${
                        activeSection === s.id
                          ? 'text-[#2a1708]'
                          : 'text-[#361508] opacity-75 group-hover:opacity-100 group-hover:text-black'
                      }`}>
                        {s.label}
                      </span>
                      <div className={`w-1.5 h-1.5 shrink-0 transition-all duration-300 origin-center ${
                        activeSection === s.id
                          ? 'bg-[#4a1c0d] scale-[1.3] rounded-[1px] rotate-45'
                          : 'bg-[#5e4b38] rounded-full opacity-40 group-hover:opacity-80 group-hover:scale-110'
                      }`} />
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Trigger dot */}
            <button
              onClick={() => setNavOpen((v) => !v)}
              className="relative flex items-center justify-center w-8 h-8"
              aria-label="Toggle navigation"
            >
              {!navOpen && (
                <motion.div
                  className="absolute inset-0 rounded-full border border-gold/25"
                  animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                />
              )}
              <motion.div
                className="w-2.5 h-2.5 rounded-full bg-gold"
                animate={{ scale: navOpen ? 1.3 : 1 }}
                transition={{ duration: 0.2 }}
              />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}