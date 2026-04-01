import React from 'react';
import { motion } from 'motion/react';

export default function ContactSection() {
  return (
    <>
        <section 
        id="contact" 
        className="w-full relative flex flex-col items-center justify-center py-40 md:py-56 z-[100] bg-[#010101]" 
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="w-[90%] max-w-4xl flex flex-col items-center text-center"
        >
          <h2 className="font-display text-4xl md:text-6xl uppercase tracking-widest text-[#e3d5c1] mb-8 drop-shadow-[0_0_15px_rgba(201,168,76,0.15)]">
            Let's Collaborate
          </h2>
          <div className="w-16 h-px bg-[#c9a84c]/30 mb-16" />
          
          <div className="flex flex-col items-center justify-center gap-12 w-full mt-4">
            
            {/* MAIN CTA: EMAIL (BOLD TEXT) */}
            <a
              href="mailto:mallickdeepmalya05@gmail.com"
              className="group relative inline-block pointer-events-auto"
            >
              <span className="font-display text-2xl md:text-4xl lg:text-5xl font-bold tracking-[0.05em] text-gold group-hover:text-[#f0e3bc] transition-colors duration-300 drop-shadow-[0_0_15px_rgba(201,168,76,0.3)]">
                mallickdeepmalya05@gmail.com
              </span>
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-hover:w-full" />
            </a>

            {/* SECONDARY OPTIONS */}
            <div className="flex items-center gap-8 md:gap-12 mt-4">
              {/* LinkedIn */}
              <a
                href="https://linkedin.com/in/deepmalya-mallick"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 pointer-events-auto py-2"
              >
                <span className="flex items-center gap-2 font-display text-[16px] md:text-xl font-bold uppercase tracking-[0.1em] text-gold group-hover:text-[#f0e3bc] transition-colors duration-300 drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gold group-hover:scale-110 group-hover:text-[#f0e3bc] transition-all duration-300">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-hover:w-full" />
              </a>

              <div className="w-1.5 h-1.5 rounded-full bg-gold/30" />

              {/* Resume */}
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex items-center gap-2 pointer-events-auto py-2"
              >
                <span className="flex items-center gap-2 font-display text-[16px] md:text-xl font-bold uppercase tracking-[0.1em] text-gold group-hover:text-[#f0e3bc] transition-colors duration-300 drop-shadow-[0_0_10px_rgba(201,168,76,0.3)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-gold group-hover:scale-110 group-hover:text-[#f0e3bc] transition-all duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  Resume
                </span>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-px bg-gold transition-all duration-500 group-hover:w-full" />
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="w-full py-8 text-center bg-[#010101] relative z-[100] border-t border-white/5">
        <p className="font-body text-[9px] md:text-[10px] uppercase tracking-[0.3em] text-gold/30">
          © {new Date().getFullYear()} Deepmalya Mallick. All rights reserved.
        </p>
      </footer>
    </>
  );
}
