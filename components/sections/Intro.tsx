
import React from 'react';
import { Section } from '../../types';

interface IntroProps {
  section: Section;
}

const Intro: React.FC<IntroProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-[80vh] px-4 md:px-24 py-20 md:py-32 flex items-center">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-24 bg-white/[0.03] backdrop-blur-2xl p-8 md:p-20 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl w-full">
        <div className="w-40 h-40 md:w-80 md:h-80 flex-shrink-0 relative">
          <div className="absolute inset-0 rounded-full scale-110 blur-2xl opacity-40" style={{ backgroundColor: section.themeColor }}></div>
          <img 
            src={section.content.imageUrl || "https://picsum.photos/400"} 
            alt="Profile" 
            className="w-full h-full object-cover rounded-full border-4 relative z-10"
            style={{ borderColor: section.themeColor }}
          />
        </div>
        <div className="text-center md:text-left space-y-4 md:space-y-6">
          <h2 className="text-3xl md:text-8xl font-playful tracking-tighter text-white uppercase leading-none">
            {section.content.title}
          </h2>
          <p className="text-lg md:text-3xl text-zinc-300 font-medium max-w-2xl leading-relaxed">
            {section.content.description}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Intro;
