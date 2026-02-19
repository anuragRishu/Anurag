
import React, { useState } from 'react';
import { 
  Settings, Plus, Trash2, ArrowUp, ArrowDown, 
  Eye, EyeOff, Sparkles, X, Layout, 
  Video, Type, Mail, Link as LinkIcon, Image as ImageIcon, PlusCircle, MinusCircle, CloudUpload, Loader2, CheckCircle, AlertCircle, Clock, ExternalLink, Database, Key, ChevronDown
} from 'lucide-react';
import { SiteConfig, Section, SectionType, SocialLink, ButtonConfig, ProjectItem } from '../types';
import { SECTION_TYPES } from '../constants';
import { generateSectionCopy } from '../services/geminiService';
import { saveSiteConfig, isSupabaseConnected, updateSupabaseConnection } from '../services/supabaseService';

interface AdminPanelProps {
  config: SiteConfig;
  lastSynced: string | null;
  onUpdate: (newConfig: SiteConfig) => void;
  onConnectionSuccess?: () => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, lastSynced, onUpdate, onConnectionSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sections' | 'connection'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [sbUrl, setSbUrl] = useState(localStorage.getItem('vivid_motion_sb_url') || "https://byqvbgwjfhqvqmebcjky.supabase.co");
  const [sbKey, setSbKey] = useState(localStorage.getItem('vivid_motion_sb_key') || "sb_publishable_r4N8VSAzk0S8_PdZYlVYCg_4dAv_1LW");

  const handleGeneralUpdate = (field: keyof SiteConfig, value: string) => {
    onUpdate({ ...config, [field]: value });
  };

  const handleManualConnect = () => {
    updateSupabaseConnection(sbUrl, sbKey);
    if (onConnectionSuccess) onConnectionSuccess();
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
    onUpdate({
      ...config,
      sections: config.sections.filter(s => s.id !== id).map((s, i) => ({ ...s, order: i }))
    });
    if (editingSectionId === id) setEditingSectionId(null);
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
    const result = await generateSectionCopy(section.type, "energetic and cinematic");
    if (result) {
      const titleMatch = result.match(/Title:\s*(.*?)(?=\n|Subtitle:|$)/i);
      const subtitleMatch = result.match(/Subtitle:\s*(.*?)(?=\n|Description:|$)/i);
      const descMatch = result.match(/Description:\s*(.*)/i);

      updateSectionContentField(section.id, 'title', titleMatch?.[1]?.trim() || section.content.title);
      updateSectionContentField(section.id, 'subtitle', subtitleMatch?.[1]?.trim() || section.content.subtitle);
      updateSectionContentField(section.id, 'description', descMatch?.[1]?.trim() || section.content.description);
    }
    setIsGenerating(false);
  };

  const addSection = (type: SectionType) => {
    const newId = `${type}-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      type,
      order: config.sections.length,
      isVisible: true,
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-vibrant-colors-40076-large.mp4",
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

  return (
    <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-10 bg-black/90 backdrop-blur-md">
      <div className="bg-zinc-950 border-t md:border border-white/10 w-full max-w-7xl h-[95vh] md:h-full md:max-h-[95vh] rounded-t-[2.5rem] md:rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative">
        {/* Header */}
        <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-3 md:gap-6">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-600 text-white rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Settings size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg md:text-2xl font-bold font-playful tracking-tight uppercase text-white truncate">Studio</h2>
              <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase truncate">
                <Clock size={10} className="shrink-0" />
                <span>{lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'Syncing...'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={handlePublish}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-4 md:px-8 py-2 md:py-3 rounded-full font-bold text-[9px] md:text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                saveStatus === 'success' ? 'bg-green-500 text-white' : 
                saveStatus === 'error' ? 'bg-red-500 text-white' : 
                'bg-white text-black hover:opacity-90'
              }`}
            >
              {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : 
               saveStatus === 'success' ? <CheckCircle size={14} /> : 
               saveStatus === 'error' ? <AlertCircle size={14} /> : 
               <CloudUpload size={14} />}
              <span className="hidden xs:inline">{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Live' : 'Publish'}</span>
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Tabs - Scrollable on mobile */}
        <div className="flex px-5 md:px-10 border-b border-white/5 gap-6 md:gap-10 bg-zinc-900/40 overflow-x-auto no-scrollbar">
          {[
            { id: 'sections', icon: Layout, label: 'Layout' },
            { id: 'general', icon: Settings, label: 'Branding' },
            { id: 'connection', icon: Database, label: 'Cloud' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 md:py-5 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-zinc-950">
          {activeTab === 'general' && (
            <div className="max-w-3xl mx-auto space-y-6 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-6 md:gap-10 bg-white/[0.03] p-6 md:p-12 rounded-[2rem] md:rounded-[3rem] border border-white/5">
                <div className="space-y-2 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Display Name</label>
                  <input 
                    type="text" 
                    value={config.siteName} 
                    onChange={e => handleGeneralUpdate('siteName', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-5 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-lg md:text-xl font-medium text-white shadow-inner"
                  />
                </div>
                <div className="space-y-2 md:space-y-4">
                  <label className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Brand Icon</label>
                  <input 
                    type="text" 
                    value={config.logo} 
                    onChange={e => handleGeneralUpdate('logo', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-5 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-lg md:text-xl font-medium text-white shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
                  <div className="space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Accent Color</label>
                    <div className="flex gap-3 md:gap-4">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                        <input type="color" className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" value={config.primaryColor} onChange={e => handleGeneralUpdate('primaryColor', e.target.value)} />
                      </div>
                      <input className="flex-1 bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 text-xs md:text-sm font-mono text-white" value={config.primaryColor} onChange={e => handleGeneralUpdate('primaryColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2 md:space-y-4">
                    <label className="text-[9px] md:text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Passcode</label>
                    <div className="relative">
                      <Key className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                      <input 
                        type="password" 
                        value={config.adminPasscode} 
                        onChange={e => handleGeneralUpdate('adminPasscode', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl pl-12 md:pl-16 pr-4 md:pr-6 py-3 md:py-5 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-lg md:text-xl font-medium text-white shadow-inner font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="max-w-5xl mx-auto space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-10 px-2 md:px-4">
                <div>
                  <h3 className="text-[10px] md:text-sm font-bold uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-500 mb-1">Architecture</h3>
                  <p className="text-zinc-500 text-[10px] md:text-xs">Manage your portfolio structure.</p>
                </div>
                <div className="relative">
                  <select 
                    onChange={(e) => { addSection(e.target.value as SectionType); e.target.value = ""; }}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold outline-none cursor-pointer transition-all text-[10px] md:text-[11px] uppercase tracking-[0.2em] shadow-xl appearance-none"
                    value=""
                  >
                    <option value="" disabled>+ APPEND SECTION</option>
                    {SECTION_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/60" />
                </div>
              </div>

              <div className="grid gap-3 md:gap-6">
                {config.sections.sort((a,b) => a.order - b.order).map((section, idx) => (
                  <div key={section.id} className={`group flex flex-col bg-white/[0.03] border-2 ${editingSectionId === section.id ? 'border-indigo-500/40 shadow-xl' : 'border-white/5'} rounded-[1.5rem] md:rounded-[3rem] overflow-hidden transition-all`}>
                    <div className="flex items-center gap-3 md:gap-8 p-3 md:p-6">
                      <div className="flex flex-col gap-1 md:gap-2">
                        <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-1 hover:text-white text-zinc-700 disabled:opacity-0 transition-colors"><ArrowUp size={16} className="md:w-5 md:h-5" /></button>
                        <button onClick={() => moveSection(idx, 'down')} disabled={idx === config.sections.length - 1} className="p-1 hover:text-white text-zinc-700 disabled:opacity-0 transition-colors"><ArrowDown size={16} className="md:w-5 md:h-5" /></button>
                      </div>
                      <div className="w-10 h-10 md:w-16 md:h-16 bg-white/5 rounded-xl md:rounded-[1.5rem] flex items-center justify-center text-zinc-400 border border-white/5 shrink-0">
                        {section.type === 'hero' ? <Layout size={18} className="md:w-6 md:h-6" /> : <ImageIcon size={18} className="md:w-6 md:h-6" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">{section.type}</span>
                          {!section.isVisible && <span className="text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-red-500">Hidden</span>}
                        </div>
                        <h4 className="font-bold text-sm md:text-2xl text-white tracking-tight truncate pr-2">{section.content.title || 'Untitled Section'}</h4>
                      </div>
                      <div className="flex items-center gap-1 md:gap-3">
                        <button onClick={() => toggleSectionVisibility(section.id)} className={`p-2 md:p-4 rounded-xl transition-all ${section.isVisible ? 'text-green-500 md:bg-green-500/10' : 'text-zinc-700'}`}>
                          {section.isVisible ? <Eye size={18} className="md:w-6 md:h-6" /> : <EyeOff size={18} className="md:w-6 md:h-6" />}
                        </button>
                        <button 
                          onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)} 
                          className={`px-3 md:px-8 py-2 md:py-4 rounded-xl md:rounded-2xl text-[9px] md:text-[11px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all ${editingSectionId === section.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-zinc-800 text-zinc-300'}`}
                        >
                          {editingSectionId === section.id ? 'Done' : 'Edit'}
                        </button>
                        <button onClick={(e) => deleteSection(e, section.id)} className="p-2 text-zinc-800 hover:text-red-500 transition-colors">
                          <Trash2 size={18} className="md:w-6 md:h-6" />
                        </button>
                      </div>
                    </div>

                    {editingSectionId === section.id && (
                      <div className="px-4 md:px-12 pb-8 md:pb-14 pt-4 md:pt-8 border-t border-white/5 bg-black/40 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 animate-in slide-in-from-top-4 duration-500">
                        {/* Column 1: Config */}
                        <div className="space-y-6 md:space-y-10">
                          <div className="space-y-2 md:space-y-4">
                            <label className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2 px-1"><Video size={12}/> Background (MP4)</label>
                            <input className="w-full bg-black/40 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-5 text-xs md:text-sm font-medium focus:ring-2 ring-indigo-500/50 outline-none text-white shadow-inner" value={section.backgroundVideo} onChange={(e) => updateSectionField(section.id, 'backgroundVideo', e.target.value)} />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                            <div className="space-y-2 md:space-y-4">
                              <label className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-zinc-500 px-1">Accent</label>
                              <div className="flex gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-14 md:h-14 rounded-xl overflow-hidden border border-white/10 shrink-0">
                                  <input type="color" className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" value={section.themeColor} onChange={(e) => updateSectionField(section.id, 'themeColor', e.target.value)} />
                                </div>
                                <input className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 text-[10px] md:text-xs font-mono text-white" value={section.themeColor} onChange={(e) => updateSectionField(section.id, 'themeColor', e.target.value)} />
                              </div>
                            </div>
                            {(section.type === 'intro' || section.type === 'about') && (
                              <div className="space-y-2 md:space-y-4">
                                <label className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2 px-1"><ImageIcon size={12}/> Image URL</label>
                                <input className="w-full bg-black/40 border border-white/10 rounded-xl px-4 md:px-5 py-3 md:py-4 text-[10px] md:text-xs text-white" value={section.content.imageUrl || ""} onChange={(e) => updateSectionContentField(section.id, 'imageUrl', e.target.value)} />
                              </div>
                            )}
                          </div>

                          {section.type === 'projects' && (
                            <div className="space-y-6 pt-4 md:pt-6 border-t border-white/5">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Project Gallery</h4>
                                <button onClick={() => addItemToSection(section.id, 'items', { id: `p-${Date.now()}`, title: 'New Montage', category: 'Commercial', thumbnail: 'https://picsum.photos/seed/new/800/450', videoUrl: '' })} className="text-[8px] md:text-[10px] px-3 md:px-4 py-1.5 md:py-2 bg-green-500/10 text-green-400 rounded-lg md:rounded-xl uppercase font-bold border border-green-500/20 shadow-lg">+ New</button>
                              </div>
                              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 md:pr-4 custom-scrollbar">
                                {section.content.items?.map((item: ProjectItem, pIdx: number) => (
                                  <div key={item.id} className="p-4 md:p-8 bg-black/60 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 relative shadow-xl">
                                    <button onClick={() => removeItemFromSection(section.id, 'items', pIdx)} className="absolute top-4 right-4 md:top-6 md:right-6 text-zinc-700 hover:text-red-500"><Trash2 size={16} /></button>
                                    <div className="space-y-4">
                                      <input className="w-full bg-transparent border-b border-white/10 py-2 text-base md:text-lg font-bold focus:border-indigo-500 outline-none text-white" placeholder="Title" value={item.title} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'title', e.target.value)} />
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                                        <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-300" placeholder="Category" value={item.category} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'category', e.target.value)} />
                                        <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] text-zinc-300" placeholder="Thumb URL" value={item.thumbnail} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'thumbnail', e.target.value)} />
                                      </div>
                                      <input className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-mono text-zinc-400" placeholder="MP4 Video URL" value={item.videoUrl || ''} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'videoUrl', e.target.value)} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Column 2: Content */}
                        <div className="space-y-6 md:space-y-10">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[9px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2 px-1"><Type size={12}/> Narrative</label>
                            <button onClick={() => handleAIAssist(section)} disabled={isGenerating} className="text-[9px] md:text-[11px] font-bold flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-indigo-500/10 text-indigo-400 rounded-lg md:rounded-2xl hover:bg-indigo-500/20 border border-indigo-500/10">
                              {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                              AI Rewrite
                            </button>
                          </div>
                          
                          <div className="space-y-6 md:space-y-10 bg-black/40 p-5 md:p-12 rounded-[1.5rem] md:rounded-[3rem] border border-white/5 shadow-inner">
                            <div className="space-y-2 md:space-y-4">
                              <label className="text-[8px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] px-1">Heading</label>
                              <input className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-5 text-sm md:text-xl font-bold outline-none focus:ring-2 ring-indigo-500/50 text-white" value={section.content.title || ""} onChange={(e) => updateSectionContentField(section.id, 'title', e.target.value)} />
                            </div>
                            
                            {['hero', 'intro', 'about', 'contact'].includes(section.type) && (
                              <div className="space-y-2 md:space-y-4">
                                <label className="text-[8px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] px-1">Description</label>
                                <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-6 text-xs md:text-base font-medium leading-relaxed resize-none outline-none focus:ring-2 ring-indigo-500/50 text-white" value={section.content.description || ""} onChange={(e) => updateSectionContentField(section.id, 'description', e.target.value)} />
                              </div>
                            )}

                            {section.type === 'contact' && (
                              <div className="space-y-6 pt-4 border-t border-white/5">
                                <div className="space-y-2">
                                  <label className="text-[8px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] px-1">Email</label>
                                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-2 md:py-4 text-xs md:text-sm text-white" value={section.content.email || ""} onChange={(e) => updateSectionContentField(section.id, 'email', e.target.value)} />
                                </div>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[8px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Socials</label>
                                    <button onClick={() => addItemToSection(section.id, 'socials', { platform: 'Instagram', url: '#' })} className="text-[8px] px-2 py-1 bg-white/10 rounded-md font-bold uppercase">+ Add</button>
                                  </div>
                                  <div className="space-y-2">
                                    {section.content.socials?.map((social, sIdx) => (
                                      <div key={sIdx} className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl relative">
                                        <input className="bg-transparent border-b border-white/10 py-1 text-[10px] font-bold text-white outline-none" value={social.platform} onChange={(e) => updateItemInSection(section.id, 'socials', sIdx, 'platform', e.target.value)} placeholder="Name" />
                                        <input className="bg-transparent border-b border-white/10 py-1 text-[9px] text-zinc-400 outline-none" value={social.url} onChange={(e) => updateItemInSection(section.id, 'socials', sIdx, 'url', e.target.value)} placeholder="URL" />
                                        <button onClick={() => removeItemFromSection(section.id, 'socials', sIdx)} className="absolute -top-1 -right-1 bg-red-500/20 text-red-500 p-1 rounded-full"><MinusCircle size={10}/></button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {section.type === 'hero' && (
                              <div className="space-y-6 pt-4 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[8px] md:text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">Actions</label>
                                  <button onClick={() => addItemToSection(section.id, 'buttons', { text: 'New Button', link: '#', variant: 'primary', visible: true })} className="text-[8px] px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-md font-bold uppercase">+ New</button>
                                </div>
                                <div className="space-y-3">
                                  {section.content.buttons?.map((btn, bIdx) => (
                                    <div key={bIdx} className="p-3 md:p-5 bg-white/5 rounded-xl md:rounded-[1.5rem] border border-white/10 shadow-lg relative space-y-3">
                                      <div className="flex justify-between items-center">
                                        <input className="bg-transparent border-b border-white/10 py-1 text-[10px] md:text-[11px] font-bold outline-none text-white w-2/3" value={btn.text} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'text', e.target.value)} />
                                        <button onClick={() => removeItemFromSection(section.id, 'buttons', bIdx)} className="text-zinc-700 hover:text-red-500"><Trash2 size={14}/></button>
                                      </div>
                                      <div className="grid grid-cols-2 gap-3">
                                        <input className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[9px] md:text-[10px] text-zinc-400 outline-none" value={btn.link} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'link', e.target.value)} placeholder="Link" />
                                        <select className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-[9px] md:text-[10px] font-bold text-white outline-none" value={btn.variant} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'variant', e.target.value)}>
                                          <option value="primary">Fill</option>
                                          <option value="outline">Border</option>
                                        </select>
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

          {activeTab === 'connection' && (
            <div className="max-w-2xl mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/[0.03] border border-white/10 rounded-[2rem] md:rounded-[4rem] p-6 md:p-16 space-y-8 md:space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-4 md:gap-6 text-indigo-400">
                  <div className="p-4 md:p-5 bg-indigo-500/10 rounded-xl md:rounded-[2rem] border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                    <Database size={32} className="md:w-12 md:h-12" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl md:text-3xl font-bold font-playful tracking-tight uppercase text-white leading-none mb-1 md:mb-2">Persistence</h3>
                    <p className="text-zinc-500 text-[8px] md:text-[10px] font-bold tracking-[0.3em] md:tracking-[0.4em] uppercase">Cloud Settings</p>
                  </div>
                </div>
                
                <div className="p-4 md:p-8 bg-black/40 border border-white/5 rounded-xl md:rounded-[2.5rem] space-y-6">
                  <p className="text-zinc-400 text-[10px] md:text-sm leading-relaxed font-medium">
                    Keys are pre-configured for instant deployment. Only change these if using your own private database.
                  </p>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500 px-1">Supabase URL</label>
                      <input 
                        type="text" 
                        value={sbUrl} 
                        onChange={e => setSbUrl(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-3 md:py-5 outline-none focus:ring-2 ring-indigo-500/50 text-xs md:text-base text-white font-mono shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-bold tracking-[0.2em] uppercase text-zinc-500 px-1">Anon Key</label>
                      <input 
                        type="password" 
                        value={sbKey} 
                        onChange={e => setSbKey(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 md:px-6 py-3 md:py-5 outline-none focus:ring-2 ring-indigo-500/50 text-xs md:text-base text-white font-mono shadow-inner"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleManualConnect}
                  className="w-full bg-white text-black py-4 md:py-6 rounded-xl md:rounded-[2rem] font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-[10px] md:text-xs hover:opacity-90 transition-all flex items-center justify-center gap-3 md:gap-4 shadow-2xl active:scale-[0.98]"
                >
                  <ExternalLink size={16} className="md:w-5 md:h-5" />
                  Test Sync
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-4 p-6 md:p-10 bg-red-500/5 border border-red-500/20 rounded-2xl md:rounded-[3rem] text-red-400 shadow-xl animate-in zoom-in-95">
                  <AlertCircle size={24} className="shrink-0 md:w-8 md:h-8" />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Error</p>
                    <p className="text-xs md:text-sm opacity-80 leading-relaxed font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
