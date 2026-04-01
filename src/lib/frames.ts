/**
 * Shared frame-sequence constants.
 * Both AboutSection and SkillsSection use 141-frame sequences;
 * keeping the count and path helpers here avoids duplication.
 */

export const FRAME_COUNT = 141;

export const aboutFramePath = (i: number) =>
  `/about/torri_sharp_frames_webp/frame_${String(i).padStart(4, '0')}.webp`;

export const skillsFramePath = (i: number) =>
  `/skills/finalbg_frames_webp/frame_${String(i).padStart(4, '0')}.webp`;
