
import React from 'react';
import { Section } from '../../types';
import Button from '../Button';

interface HeroProps {
  section: Section;
}

const Hero: React.FC<HeroProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen flex flex-col justify-center items-center px-6 md:px-24 py-20 relative overflow-hidden">
      <div className="max-w-5xl w-full relative z-10 bg-white/[0.03] backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-1000 overflow-hidden text-center">
        
        {/* Decorative background glows - Complementary colors to the Green theme */}
        <div 
          className="absolute -top-32 -right-32 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse duration-[4000ms]" 
          style={{ backgroundColor: section.themeColor }}
        ></div>
        <div 
          className="absolute -bottom-40 -left-40 w-[35rem] h-[35rem] rounded-full blur-[150px] opacity-[0.15] pointer-events-none animate-pulse duration-[6000ms]" 
          style={{ backgroundColor: '#6366f1' }} // Deep Indigo complements the Vibrant Green
        ></div>

        <div className="space-y-8 relative z-10 flex flex-col items-center">
          <div className="space-y-2 animate-in slide-in-from-bottom-8 duration-700">
            <p className="text-sm md:text-xl font-bold tracking-[0.4em] uppercase opacity-80" style={{ color: section.themeColor }}>
              {section.content.subtitle || "Cinematic Motion Designer"}
            </p>
            <h1 className="text-5xl md:text-9xl font-playful tracking-tighter leading-none text-white drop-shadow-2xl uppercase">
              {section.content.title || "Vivid Motion"}
            </h1>
          </div>
          
          <p className="text-lg md:text-2xl max-w-2xl text-zinc-300 font-medium leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-100">
            {section.content.description || "Transforming vision into reality through professional video editing."}
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-6 animate-in fade-in duration-700 delay-300">
            {section.content.buttons && section.content.buttons.length > 0 ? (
              section.content.buttons.map((btn, i) => btn.visible && (
                <Button key={i} variant={btn.variant as any} onClick={() => {
                  if (btn.link.startsWith('#')) {
                    document.getElementById(btn.link.slice(1))?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = btn.link;
                  }
                }}>
                  {btn.text}
                </Button>
              ))
            ) : (
              <Button variant="primary" onClick={() => document.getElementById('contact-1')?.scrollIntoView({ behavior: 'smooth' })}>
                Hire Me
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
