
import React from 'react';
import { Section } from '../../types';
import Hero from './Hero';
import Projects from './Projects';
import About from './About';
import Intro from './Intro';
import Contact from './Contact';

interface SectionRendererProps {
  section: Section;
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ section }) => {
  if (!section.isVisible) return null;

  switch (section.type) {
    case 'hero':
      return <Hero section={section} />;
    case 'intro':
      return <Intro section={section} />;
    case 'projects':
      return <Projects section={section} />;
    case 'about':
      return <About section={section} />;
    case 'contact':
      return <Contact section={section} />;
    default:
      return (
        <section className="min-h-screen flex items-center justify-center border-y border-white/5 bg-zinc-950/40">
          <h2 className="text-4xl font-playful opacity-20">{section.type} placeholder</h2>
        </section>
      );
  }
};

export default SectionRenderer;
