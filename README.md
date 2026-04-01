# Deepmalya Mallick — Portfolio

A cinematic, scroll-driven portfolio built with React, GSAP, and frame-by-frame canvas animation. Designed exclusively for desktop viewing.

---

## Overview

This portfolio is built around a single visual metaphor — a katana draw — that transitions the page from the hero landing into the About section. Each section has its own scroll-driven animation system, all orchestrated through GSAP ScrollTrigger and Lenis smooth scroll.

The design language is consistently cinematic: aged parchment, ink textures, gold typography, and a Japanese aesthetic that runs through every component.

---

## Sections

**Hero** — Full-screen smoke video backdrop. Name reveal animates in after video starts playing. Navbar fades in 2 seconds after play.

**About** — Katana draw animation triggered by scroll. The blade tip flash transitions into a 141-frame canvas animation sequence (torri gate + ink wash). About content (photo, bio, education modal) fades in at the end of the sequence.

**Skills** — 141-frame canvas background sequence (ink brush reveal). 19 skill cards arranged in a 3D rotating carousel ring with a samurai silhouette at the center. Carousel pauses on hover.

**Projects** — Shoji door reveal animation. A parchment scroll physically unrolls downward to expose four project cards, which then scroll upward as the user continues. Projects: AEGIS, Weave, Scry, Fruit Ninja Bot.

**Contact** — Minimal dark section. Large email CTA, LinkedIn, and resume link.

---

## Tech Stack

| Layer | Library |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Animation | GSAP + ScrollTrigger |
| Smooth Scroll | Lenis |
| Motion | Motion (Framer Motion) |
| Canvas | Native 2D Canvas API |

---

## Project Structure

```
src/
├── features/
│   ├── about/
│   │   ├── AboutSection.tsx        # Section component
│   │   └── hooks/
│   │       └── useAboutAnimation.ts # GSAP timeline + canvas render
│   ├── skills/
│   │   ├── SkillsSection.tsx
│   │   └── hooks/
│   │       └── useSkillsAnimation.ts
│   ├── projects/
│   │   ├── ProjectsSection.tsx
│   │   └── hooks/
│   │       └── useProjectsAnimation.ts # Scroll-driven DOM animation
│   └── contact/
│       └── ContactSection.tsx
├── hooks/
│   └── useFrameLoader.ts           # Shared frame preload hook (IntersectionObserver + rIC)
├── lib/
│   └── frames.ts                   # Frame count + path helpers
├── App.tsx                         # Lenis setup, nav, scroll targets
├── main.tsx
└── index.css                       # Tailwind theme, keyframes, texture utils

public/
├── about/
│   └── torri_sharp_frames_webp/    # 141 WebP frames — About canvas sequence
├── skills/
│   ├── finalbg_frames_webp/        # 141 WebP frames — Skills canvas sequence
│   └── samurai_outline.png
├── projects/                       # Project mockup images + background
├── hero/                           # smokevapor.mp4 + poster.jpg
├── icons/                          # Devicon SVGs (local)
├── textures/
│   └── wood-pattern.png            # Wood roller texture
├── favicon/
└── resume.pdf
```

---

## Architecture Notes

**Frame loading** is handled by a shared `useFrameLoader` hook. It accepts an `intersectionRef` to defer loading until the section enters the viewport, and a `priorityFrames` count to unlock animation early while the rest load in the background via `requestIdleCallback`.

**Scroll animations** are split into two patterns:
- GSAP ScrollTrigger pinned timelines (About, Skills) — frame scrubbing + element transitions tied to scroll progress
- Native scroll listener with rAF throttling (Projects) — direct DOM style manipulation for the unroll/door physics

**Navigation scroll targets** are computed post-GSAP refresh via `ScrollTrigger.addEventListener('refresh', ...)`, so pin spacer heights are already factored in before any nav click fires.

**Texture CDN independence** — all textures are served locally. No external image CDN dependencies at runtime.

---

## Getting Started

```bash
# Install
npm install

# Dev server
npm run dev

# Production build
npm run build

# Preview build
npm run preview
```

Requires Node.js 18+.

---

## Frame Assets

The two canvas animation sequences are **not included in this repository** due to file size. They are expected at:

```
public/about/torri_sharp_frames_webp/frame_0001.webp  →  frame_0141.webp
public/skills/finalbg_frames_webp/frame_0001.webp     →  frame_0141.webp
```

To generate WebP sequences from source video, use FFmpeg:

```bash
# Example: extract 141 frames from a video at ~5fps
ffmpeg -i source.mp4 -vf "fps=5,scale=1920:-1" -frames:v 141 frame_%04d.webp
```

---

## Known Limitations

- Desktop only. No mobile or tablet layout.
- Canvas frame sequences require the WebP assets to be present — the site will display a loading state indefinitely if they are missing.
- The Projects section `OPEN_H` is computed at mount time. Resizing the browser window mid-session will desync the scroll unroll animation until page refresh.

---

## License

Personal portfolio. Not licensed for reuse.

© 2025 Deepmalya Mallick