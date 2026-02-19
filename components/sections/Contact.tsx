
import React from 'react';
import { Section } from '../../types';
import { Mail, ArrowRight } from 'lucide-react';

interface ContactProps {
  section: Section;
}

const Contact: React.FC<ContactProps> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-[70vh] px-6 md:px-24 py-32 flex flex-col justify-center">
      <div className="max-w-5xl mx-auto text-center space-y-12 bg-white/[0.03] backdrop-blur-3xl p-12 md:p-24 rounded-[4rem] border border-white/10 shadow-2xl w-full relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: section.themeColor }}></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none" style={{ backgroundColor: section.themeColor }}></div>

        <div className="space-y-4 relative z-10">
          <h2 className="text-6xl md:text-9xl font-playful tracking-tighter text-white uppercase leading-none">
            {section.content.title || "Let's Talk"}
          </h2>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium">
            {section.content.description || "Drop a line for collaborations or inquiries."}
          </p>
        </div>
        
        <div className="pt-8 relative z-10">
          <a 
            href={`mailto:${section.content.email || 'hello@vividmotion.com'}`}
            className="inline-flex items-center gap-4 text-2xl md:text-4xl font-bold hover:opacity-70 transition-opacity break-all md:break-normal"
            style={{ color: section.themeColor }}
          >
            <Mail size={32} className="hidden md:block" />
            <span>{section.content.email || 'hello@vividmotion.com'}</span>
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 pt-12 relative z-10">
          {section.content.socials && section.content.socials.length > 0 ? (
            section.content.socials.map((social, idx) => (
              <a 
                key={idx} 
                href={social.url || '#'} 
                className="text-[10px] md:text-xs font-bold tracking-[0.3em] uppercase flex items-center gap-3 group text-zinc-400 hover:text-white transition-colors bg-white/5 backdrop-blur-lg px-6 py-3 rounded-full border border-white/5"
              >
                {social.platform || 'Link'}
                <ArrowRight size={14} className="-rotate-45 group-hover:rotate-0 transition-transform" />
              </a>
            ))
          ) : (
            <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest bg-white/5 px-6 py-2 rounded-full border border-white/5">No social links added yet</span>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
