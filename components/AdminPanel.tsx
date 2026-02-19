
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
  onConnectionSuccess?: () => void;
  onClose: () => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ config, lastSynced, onUpdate, onConnectionSuccess, onClose }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'sections' | 'connection'>('sections');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Manual Connection State - Defaults to provided hardcoded credentials
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
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-950 border border-white/10 w-full max-w-7xl h-full max-h-[95vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Settings size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold font-playful tracking-tight uppercase text-white leading-none mb-1">Portfolio Studio</h2>
              <div className="flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] text-zinc-500 uppercase">
                <Clock size={12} />
                <span>Last Synced: {lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'Establishing...'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handlePublish}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95 ${
                saveStatus === 'success' ? 'bg-green-500 text-white' : 
                saveStatus === 'error' ? 'bg-red-500 text-white' : 
                'bg-white text-black hover:opacity-90'
              }`}
            >
              {saveStatus === 'saving' ? <Loader2 size={16} className="animate-spin" /> : 
               saveStatus === 'success' ? <CheckCircle size={16} /> : 
               saveStatus === 'error' ? <AlertCircle size={16} /> : 
               <CloudUpload size={16} />}
              {saveStatus === 'saving' ? 'Publishing...' : 
               saveStatus === 'success' ? 'Changes Live!' : 
               saveStatus === 'error' ? 'Sync Error' : 'Publish Changes'}
            </button>
            <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white">
              <X size={28} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-10 border-b border-white/5 gap-10 bg-zinc-900/40">
          {[
            { id: 'sections', icon: Layout, label: 'Layout' },
            { id: 'general', icon: Settings, label: 'Branding' },
            { id: 'connection', icon: Database, label: 'Backend' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 py-5 text-[11px] font-bold uppercase tracking-[0.3em] border-b-2 transition-all ${
                activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-10 bg-zinc-950 scrollbar-hide">
          {activeTab === 'general' && (
            <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid gap-10 bg-white/[0.03] p-12 rounded-[3rem] border border-white/5">
                <div className="space-y-4">
                  <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Portfolio Display Name</label>
                  <input 
                    type="text" 
                    value={config.siteName} 
                    onChange={e => handleGeneralUpdate('siteName', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-xl font-medium text-white shadow-inner"
                  />
                </div>
                <div className="space-y-4">
                  <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Brand Identity Icon</label>
                  <input 
                    type="text" 
                    value={config.logo} 
                    onChange={e => handleGeneralUpdate('logo', e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-xl font-medium text-white shadow-inner"
                  />
                </div>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Primary Color</label>
                    <div className="flex gap-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                        <input type="color" className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" value={config.primaryColor} onChange={e => handleGeneralUpdate('primaryColor', e.target.value)} />
                      </div>
                      <input className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 text-sm font-mono text-white" value={config.primaryColor} onChange={e => handleGeneralUpdate('primaryColor', e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Admin Passcode</label>
                    <div className="relative">
                      <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                      <input 
                        type="password" 
                        value={config.adminPasscode} 
                        onChange={e => handleGeneralUpdate('adminPasscode', e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl pl-16 pr-6 py-5 outline-none focus:ring-2 ring-indigo-500/50 transition-all text-xl font-medium text-white shadow-inner font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
              <div className="flex items-center justify-between mb-10 px-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.4em] text-zinc-500 mb-1">Layout Architect</h3>
                  <p className="text-zinc-400 text-xs">Reorder, hide, or enhance sections with AI.</p>
                </div>
                <select 
                  onChange={(e) => { addSection(e.target.value as SectionType); e.target.value = ""; }}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold outline-none cursor-pointer transition-all text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/20 active:scale-95"
                  value=""
                >
                  <option value="" disabled>+ APPEND COMPONENT</option>
                  {SECTION_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
                </select>
              </div>

              <div className="grid gap-6">
                {config.sections.sort((a,b) => a.order - b.order).map((section, idx) => (
                  <div key={section.id} className={`group flex flex-col bg-white/[0.03] border-2 ${editingSectionId === section.id ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'border-white/5'} rounded-[3rem] overflow-hidden transition-all`}>
                    <div className="flex items-center gap-8 p-6">
                      <div className="flex flex-col gap-2">
                        <button onClick={() => moveSection(idx, 'up')} disabled={idx === 0} className="p-2 hover:text-white text-zinc-700 disabled:opacity-0 transition-colors"><ArrowUp size={20} /></button>
                        <button onClick={() => moveSection(idx, 'down')} disabled={idx === config.sections.length - 1} className="p-2 hover:text-white text-zinc-700 disabled:opacity-0 transition-colors"><ArrowDown size={20} /></button>
                      </div>
                      <div className="w-16 h-16 bg-white/5 rounded-[1.5rem] flex items-center justify-center text-zinc-400 border border-white/5 shadow-inner">
                        {section.type === 'hero' ? <Layout size={24} /> : <ImageIcon size={24} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full">{section.type}</span>
                          {!section.isVisible && <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Hidden</span>}
                        </div>
                        <h4 className="font-bold text-2xl text-white tracking-tight truncate max-w-sm">{section.content.title || 'Untitled Section'}</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => toggleSectionVisibility(section.id)} className={`p-4 rounded-2xl transition-all ${section.isVisible ? 'text-green-500 bg-green-500/10' : 'text-zinc-600 bg-white/5'}`}>
                          {section.isVisible ? <Eye size={24} /> : <EyeOff size={24} />}
                        </button>
                        <button 
                          onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)} 
                          className={`px-8 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.2em] transition-all shadow-xl ${editingSectionId === section.id ? 'bg-indigo-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'}`}
                        >
                          {editingSectionId === section.id ? 'Finish Edit' : 'Customize'}
                        </button>
                        <button onClick={(e) => deleteSection(e, section.id)} className="p-4 hover:bg-red-500/10 rounded-2xl text-zinc-700 hover:text-red-500 transition-colors">
                          <Trash2 size={24} />
                        </button>
                      </div>
                    </div>

                    {editingSectionId === section.id && (
                      <div className="px-12 pb-14 pt-8 border-t border-white/5 bg-black/40 grid md:grid-cols-2 gap-16 animate-in slide-in-from-top-6 duration-500">
                        {/* Visual Properties */}
                        <div className="space-y-10">
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2 px-2"><Video size={14}/> Background Cinema (MP4 URL)</label>
                            <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-5 text-sm font-medium focus:ring-2 ring-indigo-500/50 outline-none text-white shadow-inner" value={section.backgroundVideo} onChange={(e) => updateSectionField(section.id, 'backgroundVideo', e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-10">
                            <div className="space-y-4">
                              <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2">Theme Accent</label>
                              <div className="flex gap-4">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-white/10 shadow-lg shrink-0">
                                  <input type="color" className="w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer" value={section.themeColor} onChange={(e) => updateSectionField(section.id, 'themeColor', e.target.value)} />
                                </div>
                                <input className="flex-1 bg-black/40 border border-white/10 rounded-2xl px-5 text-xs font-mono text-white" value={section.themeColor} onChange={(e) => updateSectionField(section.id, 'themeColor', e.target.value)} />
                              </div>
                            </div>
                            {(section.type === 'intro' || section.type === 'about') && (
                              <div className="space-y-4">
                                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2 px-2"><ImageIcon size={14}/> Focal Image URL</label>
                                <input className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-xs text-white shadow-inner" value={section.content.imageUrl || ""} onChange={(e) => updateSectionContentField(section.id, 'imageUrl', e.target.value)} />
                              </div>
                            )}
                          </div>

                          {/* Complex Fields: Project List */}
                          {section.type === 'projects' && (
                            <div className="space-y-8 pt-6 border-t border-white/5">
                              <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Project Gallery</h4>
                                <button onClick={() => addItemToSection(section.id, 'items', { id: `p-${Date.now()}`, title: 'New Montage', category: 'Commercial', thumbnail: 'https://picsum.photos/seed/new/800/450', videoUrl: '' })} className="text-[10px] px-4 py-2 bg-green-500/10 text-green-400 rounded-xl uppercase font-bold hover:bg-green-500/20 transition-all border border-green-500/20 shadow-lg">+ Add Item</button>
                              </div>
                              <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-hide">
                                {section.content.items?.map((item: ProjectItem, pIdx: number) => (
                                  <div key={item.id} className="p-8 bg-black/60 rounded-[2rem] border border-white/10 relative group shadow-2xl">
                                    <button onClick={() => removeItemFromSection(section.id, 'items', pIdx)} className="absolute top-6 right-6 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                                    <div className="space-y-5">
                                      <input className="w-full bg-transparent border-b border-white/10 py-3 text-lg font-bold focus:border-indigo-500 outline-none text-white transition-all" placeholder="Project Title" value={item.title} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'title', e.target.value)} />
                                      <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Category</label>
                                          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none" value={item.category} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'category', e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                          <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">Thumbnail URL</label>
                                          <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-zinc-300 outline-none" value={item.thumbnail} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'thumbnail', e.target.value)} />
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">MP4 Video URL</label>
                                        <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-mono text-zinc-400 outline-none" value={item.videoUrl || ''} onChange={(e) => updateItemInSection(section.id, 'items', pIdx, 'videoUrl', e.target.value)} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Copy Properties */}
                        <div className="space-y-10">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 flex items-center gap-2 px-2"><Type size={14}/> Editorial Content</label>
                            <button onClick={() => handleAIAssist(section)} disabled={isGenerating} className="text-[11px] font-bold flex items-center gap-2 px-6 py-3 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500/20 transition-all border border-indigo-500/20 shadow-lg shadow-indigo-500/5">
                              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                              {isGenerating ? 'Synthesizing...' : 'AI Rewrite'}
                            </button>
                          </div>
                          
                          <div className="space-y-10 bg-black/40 p-12 rounded-[3rem] border border-white/5 shadow-inner">
                            <div className="space-y-4">
                              <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] px-2">Primary Heading</label>
                              <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-xl font-bold outline-none focus:ring-2 ring-indigo-500/50 text-white shadow-inner" value={section.content.title || ""} onChange={(e) => updateSectionContentField(section.id, 'title', e.target.value)} />
                            </div>
                            
                            {['hero', 'intro', 'about', 'contact'].includes(section.type) && (
                              <div className="space-y-4">
                                <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] px-2">Story Description</label>
                                <textarea rows={6} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-6 text-base font-medium leading-relaxed resize-none outline-none focus:ring-2 ring-indigo-500/50 text-white shadow-inner" value={section.content.description || ""} onChange={(e) => updateSectionContentField(section.id, 'description', e.target.value)} />
                              </div>
                            )}

                            {/* Section Specific: Contact & Hero Extras */}
                            {section.type === 'contact' && (
                              <div className="space-y-8 pt-4 border-t border-white/5">
                                <div className="space-y-4">
                                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] px-2 flex items-center gap-2"><Mail size={12}/> Booking Email</label>
                                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-2 ring-indigo-500/50 text-white shadow-inner" value={section.content.email || ""} onChange={(e) => updateSectionContentField(section.id, 'email', e.target.value)} />
                                </div>
                                <div className="space-y-4">
                                  <div className="flex justify-between items-center">
                                    <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] px-2">Social Hubs</label>
                                    <button onClick={() => addItemToSection(section.id, 'socials', { platform: 'Instagram', url: '#' })} className="text-[9px] px-3 py-1 bg-white/10 rounded-lg font-bold uppercase hover:bg-white/20">+ Add Link</button>
                                  </div>
                                  <div className="space-y-3">
                                    {section.content.socials?.map((social, sIdx) => (
                                      <div key={sIdx} className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 relative">
                                        <input className="bg-transparent border-b border-white/10 py-1 text-xs font-bold outline-none text-white" value={social.platform} onChange={(e) => updateItemInSection(section.id, 'socials', sIdx, 'platform', e.target.value)} placeholder="Platform" />
                                        <input className="bg-transparent border-b border-white/10 py-1 text-[10px] outline-none text-zinc-400" value={social.url} onChange={(e) => updateItemInSection(section.id, 'socials', sIdx, 'url', e.target.value)} placeholder="URL" />
                                        <button onClick={() => removeItemFromSection(section.id, 'socials', sIdx)} className="absolute -top-2 -right-2 bg-red-500 p-1 rounded-full text-white shadow-lg active:scale-90"><MinusCircle size={12}/></button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {section.type === 'hero' && (
                              <div className="space-y-6 pt-6 border-t border-white/5">
                                <div className="flex justify-between items-center">
                                  <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] px-2">Call to Action Buttons</label>
                                  <button onClick={() => addItemToSection(section.id, 'buttons', { text: 'New Button', link: '#', variant: 'primary', visible: true })} className="text-[9px] px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg font-bold uppercase hover:bg-indigo-500/30">+ New Action</button>
                                </div>
                                <div className="space-y-4">
                                  {section.content.buttons?.map((btn, bIdx) => (
                                    <div key={bIdx} className="grid grid-cols-12 gap-4 items-center bg-white/5 p-5 rounded-[1.5rem] border border-white/10 shadow-lg relative">
                                      <div className="col-span-4 space-y-2">
                                        <label className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Label</label>
                                        <input className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold outline-none text-white focus:border-indigo-500" value={btn.text} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'text', e.target.value)} />
                                      </div>
                                      <div className="col-span-4 space-y-2">
                                        <label className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Link (#id)</label>
                                        <input className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-[11px] outline-none text-zinc-400 focus:border-indigo-500" value={btn.link} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'link', e.target.value)} />
                                      </div>
                                      <div className="col-span-3 space-y-2">
                                        <label className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">Style</label>
                                        <select className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-[11px] font-bold outline-none text-white appearance-none cursor-pointer" value={btn.variant} onChange={(e) => updateItemInSection(section.id, 'buttons', bIdx, 'variant', e.target.value)}>
                                          <option value="primary">Fill</option>
                                          <option value="outline">Outline</option>
                                        </select>
                                      </div>
                                      <div className="col-span-1 flex justify-end">
                                        <button onClick={() => removeItemFromSection(section.id, 'buttons', bIdx)} className="p-2 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
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
            <div className="max-w-2xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/[0.03] border border-white/10 rounded-[4rem] p-16 space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex items-center gap-6 text-indigo-400">
                  <div className="p-5 bg-indigo-500/10 rounded-[2rem] border border-indigo-500/20 shadow-xl shadow-indigo-500/5">
                    <Database size={48} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-playful tracking-tight uppercase text-white leading-none mb-2">Cloud Persistence</h3>
                    <p className="text-zinc-500 text-xs font-bold tracking-[0.4em] uppercase">Backend Configuration</p>
                  </div>
                </div>
                
                <div className="p-8 bg-black/40 border border-white/5 rounded-[2.5rem] space-y-6">
                  <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                    To save your cinematic portfolio changes permanently, please verify your Supabase project keys. The defaults provided are currently active.
                  </p>
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2 flex items-center gap-2"><LinkIcon size={14}/> Supabase URL</label>
                      <input 
                        type="text" 
                        value={sbUrl} 
                        onChange={e => setSbUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 ring-indigo-500/50 text-base text-white shadow-inner font-mono"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500 px-2 flex items-center gap-2"><Key size={14}/> API Service Key</label>
                      <input 
                        type="password" 
                        value={sbKey} 
                        onChange={e => setSbKey(e.target.value)}
                        placeholder="your-anon-key"
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:ring-2 ring-indigo-500/50 text-base text-white shadow-inner font-mono"
                      />
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={handleManualConnect}
                  className="w-full bg-white text-black py-6 rounded-[2rem] font-bold uppercase tracking-[0.3em] text-xs hover:opacity-90 transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98]"
                >
                  <ExternalLink size={20} />
                  Test & Sync Connection
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-6 p-10 bg-red-500/5 border border-red-500/20 rounded-[3rem] text-red-400 shadow-xl animate-in zoom-in-95">
                  <AlertCircle size={32} className="shrink-0" />
                  <div className="space-y-2">
                    <p className="text-sm font-bold uppercase tracking-[0.2em]">Deployment Error</p>
                    <p className="text-sm opacity-80 leading-relaxed font-medium">{errorMessage}</p>
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
