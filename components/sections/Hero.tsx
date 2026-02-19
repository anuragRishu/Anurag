
import React from 'react';
import { Section } from '../../types';
import Button from '../Button';

interface HeroProps {
  section: Section;
}

const Hero: React.FC<HeroProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen flex flex-col justify-center items-center px-4 md:px-24 py-20 relative overflow-hidden">
      <div className="max-w-5xl w-full relative z-10 bg-white/[0.03] backdrop-blur-xl p-8 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl animate-in zoom-in-95 duration-1000 overflow-hidden text-center">
        
        <div 
          className="absolute -top-32 -right-32 w-64 md:w-[30rem] h-64 md:h-[30rem] rounded-full blur-[80px] md:blur-[120px] opacity-20 pointer-events-none animate-pulse duration-[4000ms]" 
          style={{ backgroundColor: section.themeColor }}
        ></div>
        
        <div className="space-y-6 md:space-y-8 relative z-10 flex flex-col items-center">
          <div className="space-y-2 animate-in slide-in-from-bottom-8 duration-700">
            <p className="text-[10px] md:text-xl font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase opacity-80" style={{ color: section.themeColor }}>
              {section.content.subtitle || "Cinematic Motion Designer"}
            </p>
            <h1 className="text-4xl md:text-9xl font-playful tracking-tighter leading-none text-white drop-shadow-2xl uppercase">
              {section.content.title || "Vivid Motion"}
            </h1>
          </div>
          
          <p className="text-base md:text-2xl max-w-2xl text-zinc-300 font-medium leading-relaxed animate-in slide-in-from-bottom-8 duration-700 delay-100">
            {section.content.description || "Transforming vision into reality through professional video editing."}
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 md:pt-6 animate-in fade-in duration-700 delay-300 w-full sm:w-auto">
            {section.content.buttons && section.content.buttons.length > 0 ? (
              section.content.buttons.map((btn, i) => btn.visible && (
                <Button key={i} variant={btn.variant as any} className="w-full sm:w-auto" onClick={() => {
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
              <Button variant="primary" className="w-full sm:w-auto" onClick={() => document.getElementById('contact-1')?.scrollIntoView({ behavior: 'smooth' })}>
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
