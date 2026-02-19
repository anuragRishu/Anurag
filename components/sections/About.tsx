
import React from 'react';
import { Section } from '../../types';

interface AboutProps {
  section: Section;
}

const About: React.FC<AboutProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen px-4 md:px-24 py-20 md:py-32 flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-16 items-center bg-white/[0.02] backdrop-blur-2xl p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl w-full">
        <div className="relative aspect-square w-full max-w-sm mx-auto md:max-w-none">
          <div className="absolute inset-0 rounded-[2rem] md:rounded-[4rem] rotate-6 opacity-30 blur-xl" style={{ backgroundColor: section.themeColor }}></div>
          <img 
            src={section.content.imageUrl} 
            alt="Profile" 
            className="w-full h-full object-cover rounded-[2rem] md:rounded-[4rem] relative z-10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border border-white/10"
          />
          <div className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 p-6 md:p-12 bg-white rounded-full text-black font-playful text-xl md:text-4xl hidden sm:block animate-bounce z-20 shadow-2xl">
            HI!
          </div>
        </div>

        <div className="space-y-6 md:space-y-8 text-center md:text-left">
          <h2 className="text-4xl md:text-7xl font-playful tracking-tighter text-white uppercase">
            {section.content.title}
          </h2>
          <p className="text-lg md:text-2xl text-zinc-300 leading-relaxed font-medium">
            {section.content.description}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4">
            {['Premiere', 'After Effects', 'Davinci', 'Final Cut', 'Blender'].map((tool) => (
              <span key={tool} className="px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-[10px] md:text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
