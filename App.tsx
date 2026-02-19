
import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Lock, X, ChevronRight, Loader2, Menu } from 'lucide-react';
import { SiteConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import SectionRenderer from './components/sections/SectionRenderer';
import AdminPanel from './components/AdminPanel';
import { fetchSiteConfig } from './services/supabaseService';

const App: React.FC = () => {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPasscode, setLoginPasscode] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [activeVideoUrl, setActiveVideoUrl] = useState("");
  const [scrollProgress, setScrollProgress] = useState(0);

  const loadConfig = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    try {
      const response = await fetchSiteConfig();
      if (response && response.config) {
        setConfig(response.config);
        setLastSynced(response.updatedAt);
        if (response.config.sections && response.config.sections.length > 0) {
          setActiveVideoUrl(response.config.sections[0].backgroundVideo);
        }
      } else {
        setActiveVideoUrl(DEFAULT_CONFIG.sections[0].backgroundVideo);
      }
    } catch (err) {
      console.error("Failed to load config:", err);
    } finally {
      if (showLoader) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY;
      const windowHeight = window.innerHeight;
      const totalHeight = document.body.offsetHeight;
      const progress = scrollPos / (totalHeight - windowHeight || 1);
      setScrollProgress(progress);

      const visibleSections = [...config.sections]
        .filter(s => s.isVisible)
        .sort((a, b) => a.order - b.order);
      
      const activeSectionIndex = Math.max(0, Math.floor((scrollPos + windowHeight / 2) / windowHeight));
      const activeSection = visibleSections[activeSectionIndex] || visibleSections[0];
      
      if (activeSection && activeSection.backgroundVideo !== activeVideoUrl) {
        setActiveVideoUrl(activeSection.backgroundVideo);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [config.sections, activeVideoUrl]);

  const handleAdminToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
    } else {
      setIsAdminOpen(true);
    }
  };

  const handleLogin = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (loginPasscode === config.adminPasscode) {
      setIsAuthenticated(true);
      setIsLoginModalOpen(false);
      setIsAdminOpen(true);
      setLoginError(false);
      setLoginPasscode("");
    } else {
      setLoginError(true);
      setLoginPasscode("");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
        <Loader2 className="w-12 h-12 text-white animate-spin opacity-20" />
        <p className="text-white/40 font-bold uppercase tracking-[0.3em] text-[10px] animate-pulse">Establishing Connection...</p>
      </div>
    );
  }

  const navLinks = config.sections.filter(s => s.isVisible).sort((a,b) => a.order - b.order);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-white selection:text-black">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          key={activeVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute min-w-full min-h-full object-cover opacity-30 transition-opacity duration-1000 scale-105 blur-lg"
        >
          <source src={activeVideoUrl} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60"></div>
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] px-4 md:px-6 py-4 md:py-6 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <span className="text-xl md:text-2xl filter drop-shadow-xl">{config.logo}</span>
          <span className="text-sm md:text-xl font-playful tracking-tighter uppercase whitespace-nowrap">{config.siteName}</span>
        </div>
        
        <div className="pointer-events-auto flex items-center gap-2 md:gap-6">
          <nav className="hidden lg:flex items-center gap-6 text-[10px] font-bold tracking-widest text-white/40 bg-black/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/10">
            {navLinks.map(s => (
              <a key={s.id} href={`#${s.id}`} className="hover:text-white transition-colors uppercase">
                {s.content.title?.split(' ')[0] || s.type}
              </a>
            ))}
          </nav>
          
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-3 bg-white/5 text-white rounded-full backdrop-blur-2xl border border-white/10"
          >
            <Menu size={18} />
          </button>

          <button 
            onClick={handleAdminToggle}
            className="p-3 bg-white/5 hover:bg-white text-white hover:text-black rounded-full backdrop-blur-2xl transition-all duration-300 border border-white/10 shadow-2xl group"
          >
            {isAuthenticated ? <Settings size={18} className="group-hover:rotate-90 transition-transform" /> : <Lock size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[150] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in zoom-in-95 duration-300">
          <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white"><X size={32} /></button>
          {navLinks.map(s => (
            <a 
              key={s.id} 
              href={`#${s.id}`} 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-3xl font-playful tracking-tight uppercase hover:text-indigo-400 transition-colors"
            >
              {s.content.title?.split(' ')[0] || s.type}
            </a>
          ))}
        </div>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-3xl animate-in fade-in duration-300">
          <div className="bg-zinc-900/40 border border-white/20 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 max-w-sm w-full shadow-2xl backdrop-blur-xl relative">
            <button 
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center mb-8">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
                <Lock className="text-white/60" size={20} />
              </div>
              <h2 className="text-lg md:text-xl font-bold font-playful tracking-tight uppercase text-white">Admin Access</h2>
            </div>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <input 
                type="password"
                autoFocus
                placeholder="Passcode"
                className={`w-full bg-white/5 border ${loginError ? 'border-red-500 ring-4 ring-red-500/10' : 'border-white/10'} rounded-2xl px-4 py-4 focus:ring-2 ring-white/20 outline-none transition-all text-center text-lg tracking-widest text-white`}
                value={loginPasscode}
                onChange={(e) => {
                  setLoginPasscode(e.target.value);
                  setLoginError(false);
                }}
              />
              <button 
                type="submit"
                className="w-full bg-white text-black py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
              >
                Unlock
                <ChevronRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      <main className="relative z-10">
        {config.sections
          .sort((a, b) => a.order - b.order)
          .map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
      </main>

      <footer className="relative z-10 px-6 py-12 md:py-20 border-t border-white/10 bg-black/40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 text-center md:text-left">
          <div>
            <h3 className="text-xl md:text-2xl font-playful uppercase tracking-tight mb-2">{config.logo} {config.siteName}</h3>
            <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">© {new Date().getFullYear()} Cinematic Portfolio</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">INSTA</a>
            <a href="#" className="hover:text-white transition-colors">BEHANCE</a>
            <a href="#" className="hover:text-white transition-colors">MAIL</a>
          </div>
        </div>
      </footer>

      {isAdminOpen && (
        <AdminPanel 
          config={config} 
          lastSynced={lastSynced}
          onUpdate={setConfig} 
          onConnectionSuccess={() => loadConfig(false)}
          onClose={() => setIsAdminOpen(false)} 
        />
      )}

      <div className="fixed top-0 left-0 h-1 bg-white z-[110] transition-all duration-100 pointer-events-none" style={{ width: `${scrollProgress * 100}%` }}></div>
    </div>
  );
};

export default App;
