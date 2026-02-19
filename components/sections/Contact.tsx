
import React from 'react';
import { Section } from '../../types';
import { Mail, ArrowRight } from 'lucide-react';

interface ContactProps {
  section: Section;
}

const Contact: React.FC<ContactProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-[70vh] px-4 md:px-24 py-20 md:py-32 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto text-center space-y-10 md:space-y-12 bg-white/[0.03] backdrop-blur-3xl p-8 md:p-24 rounded-[2.5rem] md:rounded-[4rem] border border-white/10 shadow-2xl w-full relative overflow-hidden">
        
        <div className="absolute -top-12 md:-top-24 -left-12 md:-left-24 w-48 md:w-96 h-48 md:h-96 rounded-full blur-[80px] md:blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: section.themeColor }}></div>
        
        <div className="space-y-4 relative z-10">
          <h2 className="text-4xl md:text-9xl font-playful tracking-tighter text-white uppercase leading-none">
            {section.content.title || "Let's Talk"}
          </h2>
          <p className="text-base md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {section.content.description || "Drop a line for collaborations or inquiries."}
          </p>
        </div>
        
        <div className="pt-4 md:pt-8 relative z-10">
          <a 
            href={`mailto:${section.content.email || 'hello@vividmotion.com'}`}
            className="inline-flex items-center gap-2 md:gap-4 text-lg md:text-4xl font-bold hover:opacity-70 transition-opacity break-all px-2"
            style={{ color: section.themeColor }}
          >
            <Mail size={24} className="hidden sm:block md:w-8 md:h-8" />
            <span>{section.content.email || 'hello@vividmotion.com'}</span>
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-3 md:gap-x-12 md:gap-y-6 pt-8 md:pt-12 relative z-10">
          {section.content.socials && section.content.socials.length > 0 ? (
            section.content.socials.map((social, idx) => (
              <a 
                key={idx} 
                href={social.url || '#'} 
                className="text-[9px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase flex items-center gap-2 md:gap-3 group text-zinc-400 hover:text-white transition-colors bg-white/5 backdrop-blur-lg px-4 py-2 md:px-6 md:py-3 rounded-full border border-white/5"
              >
                {social.platform || 'Link'}
                <ArrowRight size={12} className="md:w-3.5 md:h-3.5 -rotate-45 group-hover:rotate-0 transition-transform" />
              </a>
            ))
          ) : (
            <span className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full">No social links</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
