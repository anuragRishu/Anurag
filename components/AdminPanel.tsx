
import React, { useState } from 'react';
import { 
  Settings, Plus, Trash2, ArrowUp, ArrowDown, 
  Eye, EyeOff, Sparkles, X, Layout, 
  Video, Type, Mail, Link as LinkIcon, Image as ImageIcon, PlusCircle, MinusCircle, CloudUpload, Loader2, CheckCircle, AlertCircle, Clock, ExternalLink, Database, Key
} from 'lucide-react';
import { SiteConfig, Section, SectionType, SocialLink, ButtonConfig, ProjectItem } from '../types';
import { SECTION_TYPES } from '../constants';
import { generateSectionCopy } from '../services/geminiService';
import { saveSiteConfig, isSupabaseConnected, updateSupabaseConnection } from '../services/supabaseService';

interface AdminPanelProps {
  config: SiteConfig;
  lastSynced: string | null;
  onUpdate: (newConfig: SiteConfig) => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, lastSynced, onUpdate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sections' | 'connection'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Connection State
  const [sbUrl, setSbUrl] = useState(localStorage.getItem('vivid_motion_sb_url') || "");
  const [sbKey, setSbKey] = useState(localStorage.getItem('vivid_motion_sb_key') || "");

  const handleGeneralUpdate = (field: keyof SiteConfig, value: string) => {
    onUpdate({ ...config, [field]: value });
  };

  const handleManualConnect = () => {
    updateSupabaseConnection(sbUrl, sbKey);
    // Refresh UI state
    setActiveTab('sections');
  };

  const handlePublish = async () => {
    setSaveStatus('saving');
    setErrorMessage(null);
    
    const result = await saveSiteConfig(config);
    
    if (result.success) {
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } else {
      setSaveStatus('error');
      setErrorMessage(result.error || "An unknown error occurred.");
      setTimeout(() => {
        if (saveStatus === 'error') setSaveStatus('idle');
      }, 8000);
    }
  };

  const toggleSectionVisibility = (id: string) => {
    onUpdate({ 
      ...config, 
      sections: config.sections.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s) 
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const sortedSections = [...config.sections].sort((a, b) => a.order - b.order);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedSections.length) return;
    
    [sortedSections[index], sortedSections[targetIndex]] = [sortedSections[targetIndex], sortedSections[index]];
    
    onUpdate({ 
      ...config, 
      sections: sortedSections.map((s, i) => ({ ...s, order: i })) 
    });
  };

  const deleteSection = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSections = config.sections
      .filter(s => s.id !== id)
      .map((s, i) => ({ ...s, order: i }));
    
    onUpdate({ ...config, sections: newSections });
    if (editingSectionId === id) setEditingSectionId(null);
  };

  const addSection = (type: SectionType) => {
    const newId = `${type}-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      type,
      order: config.sections.length,
      isVisible: true,
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-slow-motion-of-a-glittery-purple-fabric-spinning-around-40118-large.mp4",
      themeColor: config.primaryColor,
      content: {
        title: "NEW " + type.toUpperCase(),
        description: "Add some playful content here.",
        items: type === 'projects' ? [] : undefined,
        buttons: type === 'hero' ? [{ text: "Click Me", link: "#", variant: "primary", visible: true }] : undefined,
        socials: type === 'contact' ? [{ platform: 'Instagram', url: '#' }] : undefined,
        email: type === 'contact' ? 'hello@vividmotion.com' : undefined,
        imageUrl: (type === 'intro' || type === 'about') ? "https://picsum.photos/seed/new/800/800" : undefined
      }
    };
    onUpdate({ ...config, sections: [...config.sections, newSection] });
    setEditingSectionId(newId);
  };

  const updateSectionField = (id: string, field: string, value: any) => {
    onUpdate({ 
      ...config, 
      sections: config.sections.map(s => s.id === id ? { ...s, [field]: value } : s) 
    });
  };

  const updateSectionContentField = (id: string, field: string, value: any) => {
    onUpdate({ 
      ...config, 
      sections: config.sections.map(s => s.id === id ? { ...s, content: { ...s.content, [field]: value } } : s) 
    });
  };

  const addItemToSection = (sectionId: string, field: string, defaultItem: any) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return;
    const currentList = (section.content as any)[field] || [];
    updateSectionContentField(sectionId, field, [...currentList, defaultItem]);
  };

  const removeItemFromSection = (sectionId: string, field: string, index: number) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return;
    const currentList = (section.content as any)[field] || [];
    updateSectionContentField(sectionId, field, currentList.filter((_: any, i: number) => i !== index));
  };

  const updateItemInSection = (sectionId: string, field: string, index: number, itemField: string, value: any) => {
    const section = config.sections.find(s => s.id === sectionId);
    if (!section) return;
    const currentList = [...((section.content as any)[field] || [])];
    currentList[index] = { ...currentList[index], [itemField]: value };
    updateSectionContentField(sectionId, field, currentList);
  };

  const handleAIAssist = async (section: Section) => {
    setIsGenerating(true);
    const result = await generateSectionCopy(section.type, "playful and high-energy");
    if (result) {
      const titleMatch = result.match(/Title:\s*(.*?)(?=\n|Subtitle:|$)/i);
      const subtitleMatch = result.match(/Subtitle:\s*(.*?)(?=\n|Description:|$)/i);
      const descMatch = result.match(/Description:\s*(.*)/i);

      updateSectionContentField(section.id, 'title', titleMatch?.[1].trim() || section.content.title);
      updateSectionContentField(section.id, 'subtitle', subtitleMatch?.[1].trim() || section.content.subtitle);
      updateSectionContentField(section.id, 'description', descMatch?.[1].trim() || section.content.description);
    }
    setIsGenerating(false);
  };

  return (
    <div className="fixed inset-0 z-[150] bg-zinc-950 flex flex-col md:flex-row h-screen overflow-hidden text-zinc-100 selection:bg-indigo-500">
      {/* Sidebar */}
      <div className="w-full md:w-80 border-r border-white/5 p-8 flex flex-col bg-zinc-900 overflow-y-auto">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Settings size={20} className="text-white" />
            </div>
            <h2 className="text-2xl font-playful tracking-tight uppercase leading-none text-white">Studio</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-500 hover:text-white"><X size={20} /></button>
        </div>
        
        {/* Sync Indicator */}
        {lastSynced && (
          <div className="mb-6 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl flex items-center gap-3">
            <Clock size={14} className="text-indigo-400" />
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Last Cloud Sync</span>
              <span className="text-[10px] font-mono text-indigo-200">
                {new Date(lastSynced).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
          </div>
        )}

        {!isSupabaseConnected() && (
          <button 
            onClick={() => setActiveTab('connection')}
            className="mb-6 px-5 py-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex flex-col gap-2 group hover:bg-orange-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-2 text-orange-400">
              <AlertCircle size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Not Connected</span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed group-hover:text-white transition-colors">Supabase keys are missing. Click here to connect your database.</p>
          </button>
        )}
        
        <nav className="space-y-3 flex-1">
          <button 
            onClick={() => setActiveTab('sections')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'sections' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Layout size={20} />
            <span className="font-bold text-sm uppercase tracking-widest text-inherit">Components</span>
          </button>
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Settings size={20} />
            <span className="font-bold text-sm uppercase tracking-widest text-inherit">Global Styles</span>
          </button>
          <button 
            onClick={() => setActiveTab('connection')}
            className={`w-full flex items-center space-x-4 px-5 py-4 rounded-2xl transition-all ${activeTab === 'connection' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 translate-x-1' : 'text-zinc-400 hover:bg-white/5'}`}
          >
            <Database size={20} />
            <span className="font-bold text-sm uppercase tracking-widest text-inherit">Connection</span>
          </button>
        </nav>

        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
          <button 
            onClick={handlePublish} 
            disabled={saveStatus === 'saving'}
            className={`w-full py-4 flex items-center justify-center gap-2 rounded-2xl font-bold transition-all text-xs uppercase tracking-[0.2em] border border-white/5 shadow-xl ${
              saveStatus === 'saving' ? 'bg-zinc-800 cursor-wait' : 
              saveStatus === 'success' ? 'bg-green-600 border-green-400/20 text-white' : 
              saveStatus === 'error' ? 'bg-red-600 border-red-400/20 text-white' : 
              'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {saveStatus === 'saving' && <Loader2 size={16} className="animate-spin" />}
            {saveStatus === 'success' && <CheckCircle size={16} />}
            {saveStatus === 'error' && <AlertCircle size={16} />}
            {saveStatus === 'idle' && <CloudUpload size={16} />}
            {saveStatus === 'idle' ? 'Publish Changes' : 
             saveStatus === 'saving' ? 'Saving...' : 
             saveStatus === 'success' ? 'Live Now!' : 'Save Failed'}
          </button>

          {errorMessage && (
            <div className="p-4 bg-black/40 border border-red-500/20 rounded-xl animate-in fade-in slide-in-from-bottom-2">
               <p className="text-[9px] text-red-400 font-bold uppercase mb-1 flex items-center gap-1"><AlertCircle size={10}/> Error Log</p>
               <p className="text-[10px] text-zinc-400 leading-tight mb-3">{errorMessage}</p>
               <button 
                onClick={() => setActiveTab('connection')}
                className="text-[9px] text-indigo-400 font-bold hover:underline flex items-center gap-1"
               >
                 Go to Connection Tab <ExternalLink size={10}/>
               </button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 md:p-16 bg-zinc-950/40">
        {activeTab === 'connection' && (
          <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
            <div>
              <h1 className="text-4xl font-playful uppercase tracking-tight mb-4">Database Connection</h1>
              <p className="text-zinc-500 font-medium">Connect your portfolio to Supabase for cloud persistence.</p>
            </div>

            <div className="bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5 space-y-8">
              <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl">
                <p className="text-xs text-indigo-300 leading-relaxed mb-4 font-medium">
                  To enable cloud syncing, you need to provide your Supabase project keys. You can find these in your **Supabase Dashboard > Settings > API**.
                </p>
                <div className="flex items-center gap-4">
                   <a href="https://supabase.com/dashboard" target="_blank" className="text-[10px] font-bold text-indigo-400 flex items-center gap-1 hover:underline">
                     Open Supabase Dashboard <ExternalLink size={12}/>
                   </a>
                </div>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2"><LinkIcon size={12}/> Supabase Project URL</label>
                  <input 
                    placeholder="https://your-project.supabase.co"
                    value={sbUrl}
                    onChange={(e) => setSbUrl(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 ring-indigo-500 outline-none text-sm font-mono"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1 flex items-center gap-2"><Key size={12}/> Anon API Key</label>
                  <input 
                    type="password"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    value={sbKey}
                    onChange={(e) => setSbKey(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 ring-indigo-500 outline-none text-sm font-mono"
                  />
                </div>
                
                <button 
                  onClick={handleManualConnect}
                  className="w-full bg-white text-black py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 text-xs uppercase tracking-widest"
                >
                  <Database size={16} />
                  Connect Database
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'general' && (
          <div className="max-w-4xl space-y-12 animate-in fade-in duration-500">
            <div>
              <h1 className="text-4xl font-playful uppercase tracking-tight mb-4">Site Identity</h1>
              <p className="text-zinc-500 font-medium">Core branding and security configuration.</p>
            </div>

            <div className="grid gap-8 bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Portfolio Display Name</label>
                <input 
                  value={config.siteName}
                  onChange={(e) => handleGeneralUpdate('siteName', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 ring-indigo-500 outline-none text-lg"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Admin Dashboard Passcode</label>
                <input 
                  type="text"
                  value={config.adminPasscode}
                  onChange={(e) => handleGeneralUpdate('adminPasscode', e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 focus:ring-2 ring-indigo-500 outline-none text-lg font-mono"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Primary Brand Color</label>
                   <div className="flex gap-4">
                    <input type="color" className="w-14 h-14 rounded-2xl bg-transparent border-none cursor-pointer" value={config.primaryColor} onChange={(e) => handleGeneralUpdate('primaryColor', e.target.value)} />
                    <input className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono" value={config.primaryColor} onChange={(e) => handleGeneralUpdate('primaryColor', e.target.value)} />
                   </div>
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Secondary Accent Color</label>
                   <div className="flex gap-4">
                    <input type="color" className="w-14 h-14 rounded-2xl bg-transparent border-none cursor-pointer" value={config.secondaryColor} onChange={(e) => handleGeneralUpdate('secondaryColor', e.target.value)} />
                    <input className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-mono" value={config.secondaryColor} onChange={(e) => handleGeneralUpdate('secondaryColor', e.target.value)} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-10 pb-32 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-playful uppercase tracking-tight mb-4">Portfolio Stack</h1>
                <p className="text-zinc-500 font-medium">Arrange and customize your content blocks.</p>
              </div>
              <select 
                onChange={(e) => { addSection(e.target.value as SectionType); e.target.value = ""; }}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold outline-none cursor-pointer transition-all text-xs uppercase tracking-widest shadow-xl shadow-indigo-600/20"
                value=""
              >
                <option value="" disabled>+ APPEND NEW COMPONENT</option>
                {SECTION_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
            </div>

            <div className="space-y-6">
              {config.sections.sort((a,b) => a.order - b.order).map((section, index) => (
                <div key={section.id} className={`bg-zinc-900/40 border-2 ${editingSectionId === section.id ? 'border-indigo-500 shadow-[0_0_40px_rgba(79,70,229,0.1)]' : 'border-white/5'} rounded-[2.5rem] transition-all overflow-hidden`}>
                  <div className="p-8 flex items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"><ArrowUp size={16} /></button>
                        <button onClick={() => moveSection(index, 'down')} disabled={index === config.sections.length - 1} className="p-2 text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"><ArrowDown size={16} /></button>
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full uppercase tracking-widest">{section.type}</span>
                          {!section.isVisible && <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest text-zinc-500">Hidden</span>}
                        </div>
                        <h3 className="font-bold text-xl text-zinc-200">{section.content.title || "Untitled Section"}</h3>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleSectionVisibility(section.id)} className={`p-3 rounded-2xl transition-colors ${section.isVisible ? 'text-green-500 bg-green-500/10' : 'text-zinc-600 bg-white/5'}`}>
                        {section.isVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                      <button 
                        onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)}
                        className={`px-8 py-3 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all ${editingSectionId === section.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                      >
                        {editingSectionId === section.id ? 'Finish' : 'Customize'}
                      </button>
                      <button 
                        onClick={(e) => deleteSection(e, section.id)} 
                        className="p-3 text-zinc-500 hover:text-red-500 rounded-2xl hover:bg-red-500/10 transition-all"
                        title="Remove Section"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {editingSectionId === section.id && (
                    <div className="px-10 pb-12 pt-8 border-t border-white/5 grid md:grid-cols-2 gap-16 animate-in slide-in-from-top-4 duration-500">
                      {/* Left Side: Visuals & Media */}
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Video size={14}/> Cinematic Background (.mp4 URL)</label>
                          <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-1 ring-indigo-500 outline-none text-white" value={section.backgroundVideo} onChange={(e) => updateSectionField(section.id, 'backgroundVideo', e.target.value)} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Section Tone Color</label>
                            <div className="flex gap-3">
                              <input type="color" className="h-12 w-12 rounded-xl bg-transparent border-none cursor-pointer" value={section.themeColor} onChange={(e) => updateSectionField(section.id, 'themeColor', e.target.value)} />
                              <input className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xs font-mono text-white" value={section.themeColor} onChange={(e) => updateSectionField(section.id, 'themeColor', e.target.value)} />
                            </div>
                          </div>
                          {(section.type === 'intro' || section.type === 'about') && (
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Image URL</label>
                              <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs text-white" value={section.content.imageUrl || ""} onChange={(e) => updateSectionContentField(section.id, 'imageUrl', e.target.value)} />
                            </div>
                          )}
                        </div>

                        {section.type === 'projects' && (
                          <div className="space-y-6 pt-6">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                              <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Project Gallery Items</h4>
                              <button onClick={() => addItemToSection(section.id, 'items', { id: `p-${Date.now()}`, title: 'New Edit', category: 'Commercial', thumbnail: 'https://picsum.photos/seed/new/800/450', videoUrl: '' })} className="text-[9px] px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg uppercase font-bold hover:bg-green-500/20 transition-all">+ Add Project</button>
                            </div>
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-3 scrollbar-thin">
                              {section.content.items?.map((item: ProjectItem, idx: number) => (
                                <div key={item.id} className="p-6 bg-black/40 rounded-3xl border border-white/5 relative group">
                                  <button onClick={() => removeItemFromSection(section.id, 'items', idx)} className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                  <div className="space-y-4">
                                    <input className="w-full bg-transparent border-b border-white/10 py-2 text-sm font-bold focus:border-white outline-none text-white" placeholder="Project Title" value={item.title} onChange={(e) => updateItemInSection(section.id, 'items', idx, 'title', e.target.value)} />
                                    <div className="grid grid-cols-2 gap-4">
                                      <input className="bg-transparent border-b border-white/10 py-1 text-xs opacity-60 outline-none text-white" placeholder="Category" value={item.category} onChange={(e) => updateItemInSection(section.id, 'items', idx, 'category', e.target.value)} />
                                      <input className="bg-transparent border-b border-white/10 py-1 text-xs opacity-60 outline-none text-white" placeholder="Thumbnail URL" value={item.thumbnail} onChange={(e) => updateItemInSection(section.id, 'items', idx, 'thumbnail', e.target.value)} />
                                    </div>
                                    <input className="w-full bg-transparent border-b border-white/10 py-1 text-[10px] font-mono opacity-80 outline-none focus:border-white text-white" placeholder="Direct Video URL (.mp4)" value={item.videoUrl || ''} onChange={(e) => updateItemInSection(section.id, 'items', idx, 'videoUrl', e.target.value)} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Side: Copy & Content */}
                      <div className="space-y-10">
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2"><Type size={14}/> Messaging Content</label>
                          <button onClick={() => handleAIAssist(section)} disabled={isGenerating} className="text-[10px] font-bold flex items-center gap-2 px-5 py-2 bg-indigo-500/10 text-indigo-400 rounded-full hover:bg-indigo-500/20 transition-all">
                            <Sparkles size={14} /> {isGenerating ? 'AI Thinking...' : 'AI Rewrite'}
                          </button>
                        </div>
                        
                        <div className="space-y-8 bg-zinc-900/40 p-10 rounded-[2.5rem] border border-white/5">
                          <div className="space-y-3">
                            <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-1">Heading Title</label>
                            <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-lg font-bold outline-none focus:ring-1 ring-indigo-500 text-white" value={section.content.title || ""} onChange={(e) => updateSectionContentField(section.id, 'title', e.target.value)} />
                          </div>
                          
                          {['hero', 'intro', 'about', 'contact'].includes(section.type) && (
                            <div className="space-y-3">
                              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-1">Body Description</label>
                              <textarea rows={5} className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm font-medium leading-relaxed resize-none outline-none focus:ring-1 ring-indigo-500 text-white" value={section.content.description || ""} onChange={(e) => updateSectionContentField(section.id, 'description', e.target.value)} />
                            </div>
                          )}

                          {section.type === 'contact' && (
                            <div className="space-y-3 pt-4">
                              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest px-1 flex items-center gap-2"><Mail size={12}/> Primary Email</label>
                              <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-1 ring-indigo-500 text-white" value={section.content.email || ""} onChange={(e) => updateSectionContentField(section.id, 'email', e.target.value)} />
                            </div>
                          )}

                          {section.type === 'hero' && (
                            <div className="space-y-6 pt-6 border-t border-white/5">
                              <div className="flex justify-between items-center">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Action Buttons</label>
                                <button onClick={() => addItemToSection(section.id, 'buttons', { text: 'New Button', link: '#', variant: 'primary', visible: true })} className="text-[9px] px-2 py-1 bg-white/10 rounded font-bold uppercase hover:bg-white/20 text-white">+ Add</button>
                              </div>
                              <div className="space-y-4">
                                {section.content.buttons?.map((btn: ButtonConfig, bIdx: number) => (
                                  <div key={bIdx} className="grid grid-cols-12 gap-3 items-center bg-black/20 p-4 rounded-2xl border border-white/5">
                                    <div className="col-span-4">
                                      <input className="w-full bg-transparent border-b border-white/10 py-1 text-xs font-bold outline-none text-white" value={btn.text} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'text', e.target.value)} placeholder="Text" />
                                    </div>
                                    <div className="col-span-4">
                                      <input className="w-full bg-transparent border-b border-white/10 py-1 text-xs outline-none text-white" value={btn.link} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'link', e.target.value)} placeholder="Link" />
                                    </div>
                                    <div className="col-span-3">
                                      <select className="bg-transparent text-[10px] font-bold outline-none w-full text-white" value={btn.variant} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'variant', e.target.value)}>
                                        <option value="primary">Fill</option>
                                        <option value="outline">Outline</option>
                                      </select>
                                    </div>
                                    <div className="col-span-1 flex justify-end">
                                      <button onClick={() => removeItemFromSection(section.id, 'buttons', bIdx)} className="text-zinc-600 hover:text-red-500"><MinusCircle size={16}/></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <style>{`
        .scrollbar-thin::-webkit-scrollbar { width: 5px; }
        .scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminPanel;
