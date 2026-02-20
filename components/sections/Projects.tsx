
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Section, ProjectItem } from '../../types';
import { Play, Volume2, VolumeX, Maximize2, AlertCircle, ExternalLink, X, Info } from 'lucide-react';

interface ProjectCardProps {
  item: ProjectItem;
  themeColor: string;
  onPlay: (item: ProjectItem) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ item, themeColor, onPlay }) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isDirectVideo = useMemo(() => {
    if (!item.videoUrl) return false;
    const url = item.videoUrl.toLowerCase();
    return url.endsWith('.mp4') || 
           url.endsWith('.webm') || 
           url.endsWith('.ogg') || 
           url.includes('mixkit.co/videos/preview') ||
           url.includes('v.ftcdn.net');
  }, [item.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isDirectVideo) return;

    if (isHovered && !hasError) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          if (video.readyState === 0) setHasError(true);
        });
      }
    } else {
      video.pause();
    }
  }, [isHovered, hasError, isDirectVideo]);

  const handleVideoError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoadedData = () => {
    setIsLoading(false);
    setHasError(false);
  };

  return (
    <div 
      className="group relative w-full aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-zinc-900 border border-white/10 cursor-pointer shadow-2xl transition-all duration-500 hover:border-white/40"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay(item)}
    >
      {/* Base Thumbnail */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img 
          src={item.thumbnail || "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1200&auto=format&fit=crop"} 
          alt={item.title}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105 ${isDirectVideo && isHovered && !hasError && !isLoading ? 'opacity-0' : 'opacity-100'}`}
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors duration-500"></div>
      </div>

      {/* Direct Video Preview */}
      {isDirectVideo && !hasError && (
        <div className="absolute inset-0 w-full h-full z-10">
          <video
            ref={videoRef}
            src={item.videoUrl}
            loop
            muted={isMuted}
            playsInline
            preload="auto"
            onLoadedData={handleLoadedData}
            onError={handleVideoError}
            className={`w-full h-full object-cover object-center transition-opacity duration-500 ${isHovered && !isLoading ? 'opacity-100' : 'opacity-0'}`}
          />
        </div>
      )}

      {/* Social/Embed Indicator */}
      {!isDirectVideo && isHovered && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm p-6 text-center animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4">
             <Play size={24} className="text-white fill-white ml-1" />
          </div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">Launch YouTube Theater</p>
        </div>
      )}

      {/* Information Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-5 md:p-8 z-30">
        <div className="transform translate-y-0 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-500 ease-out">
          <p className="text-[9px] font-bold tracking-[0.2em] uppercase mb-1" style={{ color: themeColor }}>
            {item.category}
          </p>
          <h3 className="text-lg md:text-2xl font-playful tracking-tight text-white mb-4 leading-tight uppercase">
            {item.title}
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                <Play size={16} fill="currentColor" className="ml-0.5" />
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-white/80">
                Play Master
              </span>
            </div>
            <Maximize2 size={16} className="text-white/40 group-hover:text-white transition-colors" />
          </div>
        </div>
      </div>
    </div>
  );
};

const VideoModal: React.FC<{ item: ProjectItem; onClose: () => void; themeColor: string }> = ({ item, onClose, themeColor }) => {
  const embedUrl = useMemo(() => {
    const url = item.videoUrl || '';
    // Enhanced YouTube parsing with Autoplay + Mute (usually required for modern autoplay)
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0&modestbranding=1`;
    }
    if (url.includes('vimeo.com/')) {
      const id = url.split('vimeo.com/')[1].split('?')[0];
      return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1&badge=0&autopause=0&player_id=0&app_id=58479`;
    }
    if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
      return `${url.split('?')[0]}embed/`;
    }
    return null;
  }, [item.videoUrl]);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={onClose}></div>
      
      <div className="relative w-full max-w-6xl aspect-video bg-zinc-950 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] border border-white/5 flex flex-col">
        <div className="absolute top-6 right-6 z-50">
          <button 
            onClick={onClose}
            className="p-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-md transition-all border border-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 bg-black relative flex items-center justify-center">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="w-full h-full border-none"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              title={item.title}
            ></iframe>
          ) : item.videoUrl ? (
            <video 
              src={item.videoUrl} 
              controls 
              autoPlay 
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-10">
              <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
              <p className="text-white font-bold uppercase tracking-widest">Video Stream Missing</p>
            </div>
          )}
        </div>

        <div className="p-6 md:p-10 bg-zinc-900/50 backdrop-blur-xl border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: themeColor }}>{item.category}</span>
            <h3 className="text-xl md:text-3xl font-playful uppercase text-white tracking-tight leading-none">{item.title}</h3>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => window.open(item.videoUrl, '_blank')}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all"
            >
              <ExternalLink size={14} />
              Open YouTube
            </button>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all"
            >
              Close Theater
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Projects: React.FC<{ section: Section }> = ({ section }) => {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);

  return (
    <section id={section.id} className="min-h-screen px-4 md:px-12 lg:px-24 py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-20 relative z-10 bg-white/[0.02] backdrop-blur-3xl p-6 md:p-16 rounded-[2.5rem] md:rounded-[4rem] border border-white/5">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-10 text-center md:text-left items-center md:items-start">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="w-8 h-[2px]" style={{ backgroundColor: section.themeColor }}></div>
              <span className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase opacity-50">Master Timeline</span>
            </div>
            <h2 className="text-4xl md:text-8xl font-playful tracking-tighter text-white uppercase leading-none">
              {section.content.title || "Cinema"}
            </h2>
            <p className="text-zinc-400 text-base md:text-xl font-medium max-w-xl mx-auto md:mx-0">
              {section.content.description || "Crafting visual rhythms that move the audience."}
            </p>
          </div>
          <div className="hidden lg:flex items-center gap-6 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md">
             <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/5 border border-white/10">
               <Info size={20} className="text-white/40" />
             </div>
             <div>
               <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Theater Mode</p>
               <p className="text-xs text-white/80">Click to autoplay in our cinema player</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {section.content.items && section.content.items.length > 0 ? (
            section.content.items.map((item: any) => (
              <ProjectCard 
                key={item.id} 
                item={item} 
                themeColor={section.themeColor} 
                onPlay={setActiveProject}
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-[2.5rem] bg-white/[0.01]">
              <p className="text-zinc-600 font-bold uppercase tracking-[0.3em] text-[10px]">Your portfolio timeline is empty.</p>
            </div>
          )}
        </div>
      </div>
      
      {activeProject && (
        <VideoModal 
          item={activeProject} 
          onClose={() => setActiveProject(null)} 
          themeColor={section.themeColor} 
        />
      )}

      {/* Background Atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-indigo-500/[0.03] blur-[150px] rounded-full pointer-events-none"></div>
    </section>
  );
};

export default Projects;
