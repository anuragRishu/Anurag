
import React, { useState, useRef, useEffect } from 'react';
import { Section, ProjectItem } from '../../types';
import { Play, Volume2, VolumeX } from 'lucide-react';

interface ProjectCardProps {
  item: ProjectItem;
  themeColor: string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item, themeColor }) => {
  const [isMuted, setIsMuted] = useState(false); // Requested: unmuted auto-play
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsMuted(true);
        });
      }
    }
  }, []);

  return (
    <div className="group relative aspect-video rounded-[2.5rem] overflow-hidden bg-white/5 backdrop-blur-md border border-white/10 cursor-pointer shadow-2xl transition-all duration-500 hover:border-white/30 hover:shadow-white/5">
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
      
      {/* Mute/Unmute Toggle Button */}
      {item.videoUrl && (
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-6 right-6 z-20 p-3 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white hover:text-black transition-all active:scale-90 border border-white/10"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 md:p-10 backdrop-blur-sm">
        <div className="translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
          <p className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: themeColor }}>
            {item.category}
          </p>
          <h3 className="text-3xl font-playful tracking-tight text-white mb-6">
            {item.title}
          </h3>
          <div className="flex items-center gap-3 text-white font-bold">
            <div className="p-4 rounded-full bg-white text-black shadow-xl group-hover:scale-110 transition-transform">
              <Play size={20} fill="currentColor" />
            </div>
            <span className="text-sm uppercase tracking-widest">Open Reel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC<{ section: Section }> = ({ section }) => {
  return (
    <section id={section.id} className="min-h-screen px-6 md:px-24 py-32 relative">
      <div className="max-w-7xl mx-auto space-y-20 relative z-10 bg-white/[0.02] backdrop-blur-xl p-10 md:p-16 rounded-[4rem] border border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
          <div className="space-y-4">
            <h2 className="text-6xl md:text-8xl font-playful tracking-tighter text-white uppercase leading-none">
              {section.content.title || "Selected Works"}
            </h2>
            <p className="text-zinc-400 text-lg md:text-xl font-medium max-w-xl">
              High-octane edits and motion graphics designed to leave a lasting impact.
            </p>
          </div>
          <div className="hidden md:block h-px flex-1 bg-white/10 mx-12 mb-8"></div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {section.content.items?.map((item: any) => (
            <ProjectCard key={item.id} item={item} themeColor={section.themeColor} />
          ))}
          {(!section.content.items || section.content.items.length === 0) && (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.02]">
              <p className="text-zinc-600 font-bold uppercase tracking-widest">No bangers found in the gallery yet.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Projects;
