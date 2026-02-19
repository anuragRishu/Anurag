
import React from 'react';
import { Section } from '../../types';

interface AboutProps {
  section: Section;
}

const About: React.FC<AboutProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen px-6 md:px-24 py-32 flex items-center">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center bg-white/[0.02] backdrop-blur-2xl p-12 md:p-20 rounded-[4rem] border border-white/10 shadow-2xl w-full">
        <div className="relative aspect-square">
          <div className="absolute inset-0 rounded-[4rem] rotate-6 opacity-30 blur-xl" style={{ backgroundColor: section.themeColor }}></div>
          <img 
            src={section.content.imageUrl} 
            alt="Profile" 
            className="w-full h-full object-cover rounded-[4rem] relative z-10 grayscale hover:grayscale-0 transition-all duration-700 shadow-2xl border border-white/10"
          />
          <div className="absolute -bottom-8 -right-8 p-12 bg-white rounded-full text-black font-playful text-4xl hidden lg:block animate-bounce z-20 shadow-2xl">
            HI!
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-5xl md:text-7xl font-playful tracking-tighter text-white">
            {section.content.title}
          </h2>
          <p className="text-2xl text-zinc-300 leading-relaxed font-medium">
            {section.content.description}
          </p>
          <div className="flex flex-wrap gap-4">
            {['Premiere', 'After Effects', 'Davinci', 'Final Cut', 'Blender'].map((tool) => (
              <span key={tool} className="px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-sm font-bold tracking-widest uppercase text-white/80 hover:text-white transition-colors">
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
