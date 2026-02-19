
import React, { useState, useRef, useEffect } from 'react';
import { Section, ProjectItem } from '../../types';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface ProjectCardProps {
  item: ProjectItem;
  themeColor: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item, themeColor }) => {
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    }
  }, []);

  return (
    <div className="group relative aspect-video rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer shadow-2xl transition-all duration-500 hover:border-white/30">
      {item.videoUrl ? (
        <video
          ref={videoRef}
          src={item.videoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      ) : (
        <img 
          src={item.thumbnail} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
      )}
      
      {item.videoUrl && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-4 right-4 md:top-6 md:right-6 z-20 p-2 md:p-3 bg-black/40 backdrop-blur-xl rounded-full text-white border border-white/10"
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6 md:p-10 backdrop-blur-[2px] md:backdrop-blur-sm">
        <div className="md:translate-y-8 md:group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-[10px] font-bold tracking-[0.2em] uppercase mb-1 md:mb-2" style={{ color: themeColor }}>
            {item.category}
          </p>
          <h3 className="text-xl md:text-3xl font-playful tracking-tight text-white mb-4 md:mb-6 leading-tight">
            {item.title}
          </h3>
          <div className="flex items-center gap-3 text-white font-bold">
            <div className="p-3 md:p-4 rounded-full bg-white text-black shadow-xl md:group-hover:scale-110 transition-transform">
              <Play size={16} fill="currentColor" className="md:w-5 md:h-5" />
            </div>
            <span className="text-[10px] md:text-sm uppercase tracking-widest">Open Reel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC<{ section: Section }> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen px-4 md:px-24 py-20 md:py-32 relative">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20 relative z-10 bg-white/[0.02] backdrop-blur-xl p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-8xl font-playful tracking-tighter text-white uppercase leading-none">
              {section.content.title || "Selected Works"}
            </h2>
            <p className="text-zinc-400 text-base md:text-xl font-medium max-w-xl">
              High-octane edits and motion graphics designed to leave a lasting impact.
            </p>
          </div>
          <div className="hidden md:block h-px flex-1 bg-white/10 mx-12 mb-8"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
          {section.content.items?.map((item: any) => (
            <ProjectCard key={item.id} item={item} themeColor={section.themeColor} />
          ))}
          {(!section.content.items || section.content.items.length === 0) && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
              <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No bangers found in the gallery yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
