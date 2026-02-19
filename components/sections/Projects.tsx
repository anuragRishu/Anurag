
import React, { useState, useRef, useEffect } from 'react';
import { Section, ProjectItem } from '../../types';
import { Play, Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface ProjectCardProps {
  item: ProjectItem;
  themeColor: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item, themeColor }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attempt to play/pause based on hover state
  useEffect(() => {
    if (videoRef.current) {
      if (isHovered) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn("Autoplay interaction required:", err);
          });
        }
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovered]);

  return (
    <div 
      className="group relative w-full aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-2xl transition-all duration-500 hover:border-white/40 hover:shadow-indigo-500/20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Media Layer - Ensuring it fills the aspect-video container */}
      <div className="relative w-full h-full z-10">
        {item.videoUrl ? (
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.thumbnail}
            loop
            muted={isMuted} // Controlled by state
            playsInline
            preload="metadata"
            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          />
        ) : (
          <img 
            src={item.thumbnail} 
            alt={item.title}
            loading="lazy"
            className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
          />
        )}
      </div>

      {/* Interactive Controls - Only for Videos */}
      {item.videoUrl && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-4 right-4 z-30 p-2 md:p-3 bg-black/60 backdrop-blur-xl rounded-full text-white border border-white/10 hover:bg-white hover:text-black transition-all active:scale-90"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* Information Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 md:p-8 z-20">
        <div className="transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: themeColor }}>
            {item.category}
          </p>
          <h3 className="text-lg md:text-2xl font-playful tracking-tight text-white mb-4 leading-tight uppercase">
            {item.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl">
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/80">View Project</span>
            </div>
            <Maximize2 size={16} className="text-white/40 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>

      {/* Decorative Shine */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-15"></div>
    </div>
  );
};

const Projects: React.FC<{ section: Section }> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen px-4 md:px-12 lg:px-24 py-20 md:py-32 relative">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20 relative z-10 bg-white/[0.02] backdrop-blur-3xl p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/5">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="w-8 h-[2px]" style={{ backgroundColor: section.themeColor }}></div>
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">Showcase</span>
            </div>
            <h2 className="text-4xl md:text-8xl font-playful tracking-tighter text-white uppercase leading-none">
              {section.content.title || "Cinema"}
            </h2>
            <p className="text-zinc-400 text-base md:text-xl font-medium max-w-xl">
              {section.content.description || "Crafting visual rhythms that move the audience."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {section.content.items && section.content.items.length > 0 ? (
            section.content.items.map((item: any) => (
              <ProjectCard key={item.id} item={item} themeColor={section.themeColor} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
              <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px]">Your portfolio timeline is empty.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default Projects;
