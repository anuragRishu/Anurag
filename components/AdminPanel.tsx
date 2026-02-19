
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

// Completed AdminPanel component fixing the truncated file and missing export
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
    // Refresh UI state via App.tsx
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
  };

  const handleSectionContentUpdate = (id: string, field: string, value: any) => {
    onUpdate({
      ...config,
      sections: config.sections.map(s => s.id === id ? {
        ...s,
        content: { ...s.content, [field]: value }
      } : s)
    });
  };

  const handleGenerateAI = async (id: string, type: string) => {
    setIsGenerating(true);
    const result = await generateSectionCopy(type, "energetic and modern");
    if (result) {
      // Basic parsing of the expected AI output format: "Title: [title], Subtitle: [subtitle], Description: [description]"
      const titleMatch = result.match(/Title:\s*(.*?)(?:, Subtitle:|$)/i);
      const subtitleMatch = result.match(/Subtitle:\s*(.*?)(?:, Description:|$)/i);
      const descMatch = result.match(/Description:\s*(.*)/i);

      onUpdate({
        ...config,
        sections: config.sections.map(s => s.id === id ? {
          ...s,
          content: {
            ...s.content,
            title: titleMatch ? titleMatch[1] : s.content.title,
            subtitle: subtitleMatch ? subtitleMatch[1] : s.content.subtitle,
            description: descMatch ? descMatch[1] : s.content.description,
          }
        } : s)
      });
    }
    setIsGenerating(false);
  };

  const addSection = () => {
    const newId = `section-${Date.now()}`;
    const newSection: Section = {
      id: newId,
      type: 'hero',
      order: config.sections.length,
      isVisible: true,
      backgroundVideo: "https://assets.mixkit.co/videos/preview/mixkit-abstract-motion-of-vibrant-colors-40076-large.mp4",
      themeColor: config.primaryColor,
      content: {
        title: "NEW SECTION",
        description: "Section description goes here."
      }
    };
    onUpdate({ ...config, sections: [...config.sections, newSection] });
    setEditingSectionId(newId);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-10 bg-black/80 backdrop-blur-md">
      <div className="bg-zinc-900 border border-white/10 w-full max-w-6xl h-full max-h-[90vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-lg">
              <Settings size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-playful tracking-tight uppercase text-white">Portfolio Studio</h2>
              <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-zinc-500 uppercase">
                <Clock size={10} />
                <span>Last Synced: {lastSynced ? new Date(lastSynced).toLocaleTimeString() : 'Never'}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handlePublish}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all ${
                saveStatus === 'success' ? 'bg-green-500 text-white' : 
                saveStatus === 'error' ? 'bg-red-500 text-white' : 
                'bg-white text-black hover:opacity-90 active:scale-95'
              }`}
            >
              {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : 
               saveStatus === 'success' ? <CheckCircle size={14} /> : 
               saveStatus === 'error' ? <AlertCircle size={14} /> : 
               <CloudUpload size={14} />}
              {saveStatus === 'saving' ? 'Publishing...' : 
               saveStatus === 'success' ? 'Live!' : 
               saveStatus === 'error' ? 'Retry' : 'Go Live'}
            </button>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-8 border-b border-white/5 gap-8 bg-zinc-900">
          {[
            { id: 'sections', icon: Layout, label: 'Sections' },
            { id: 'general', icon: Settings, label: 'Settings' },
            { id: 'connection', icon: Database, label: 'Database' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === tab.id ? 'border-white text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-zinc-900 scrollbar-hide">
          {activeTab === 'general' && (
            <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="space-y-4">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">Site Name</label>
                <input 
                  type="text" 
                  value={config.siteName} 
                  onChange={e => handleGeneralUpdate('siteName', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-white/20 transition-all text-lg font-medium text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">Logo Icon / Text</label>
                <input 
                  type="text" 
                  value={config.logo} 
                  onChange={e => handleGeneralUpdate('logo', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:ring-2 ring-white/20 transition-all text-lg font-medium text-white"
                />
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">Admin Passcode</label>
                <div className="relative">
                  <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input 
                    type="password" 
                    value={config.adminPasscode} 
                    onChange={e => handleGeneralUpdate('adminPasscode', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-4 outline-none focus:ring-2 ring-white/20 transition-all text-lg font-medium text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'sections' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Layout Arrangement</h3>
                <button 
                  onClick={addSection}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white text-white hover:text-black px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border border-white/10 shadow-lg active:scale-95"
                >
                  <PlusCircle size={14} />
                  New Section
                </button>
              </div>

              <div className="grid gap-4">
                {config.sections.sort((a,b) => a.order - b.order).map((section, idx) => (
                  <div key={section.id} className="group flex flex-col bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.07] hover:border-white/20">
                    <div className="flex items-center gap-4 p-4">
                      <div className="flex flex-col gap-1">
                        <button onClick={() => moveSection(idx, 'up')} className="p-1 hover:text-white text-zinc-600 transition-colors"><ArrowUp size={14} /></button>
                        <button onClick={() => moveSection(idx, 'down')} className="p-1 hover:text-white text-zinc-600 transition-colors"><ArrowDown size={14} /></button>
                      </div>
                      <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 border border-white/5">
                        {section.type === 'hero' ? <Layout size={20} /> : <ImageIcon size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold tracking-widest uppercase text-zinc-500">{section.type}</span>
                          {!section.isVisible && <EyeOff size={10} className="text-red-500" />}
                        </div>
                        <h4 className="font-bold text-white uppercase tracking-tight truncate max-w-xs">{section.content.title || 'Untitled Section'}</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => toggleSectionVisibility(section.id)} className="p-3 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors">
                          {section.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        <button onClick={() => setEditingSectionId(editingSectionId === section.id ? null : section.id)} className={`p-3 rounded-full transition-colors ${editingSectionId === section.id ? 'bg-white text-black' : 'hover:bg-white/10 text-zinc-400 hover:text-white'}`}>
                          <Settings size={18} />
                        </button>
                        <button onClick={(e) => deleteSection(e, section.id)} className="p-3 hover:bg-red-500/10 rounded-full text-zinc-600 hover:text-red-500 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>

                    {editingSectionId === section.id && (
                      <div className="px-12 pb-10 pt-6 border-t border-white/5 bg-black/40 space-y-8 animate-in slide-in-from-top-4 duration-300">
                        <div className="grid md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Section Title</label>
                              <button 
                                onClick={() => handleGenerateAI(section.id, section.type)}
                                disabled={isGenerating}
                                className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest transition-colors disabled:opacity-50"
                              >
                                {isGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                AI Remix
                              </button>
                            </div>
                            <input 
                              type="text" 
                              value={section.content.title || ''} 
                              onChange={e => handleSectionContentUpdate(section.id, 'title', e.target.value)}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-white/10 text-sm text-white"
                            />
                          </div>
                          <div className="space-y-4">
                            <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Accent Color</label>
                            <div className="flex gap-3">
                              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                                <input 
                                  type="color" 
                                  value={section.themeColor} 
                                  onChange={e => {
                                    onUpdate({
                                      ...config,
                                      sections: config.sections.map(s => s.id === section.id ? { ...s, themeColor: e.target.value } : s)
                                    });
                                  }}
                                  className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                                />
                              </div>
                              <input 
                                type="text" 
                                value={section.themeColor} 
                                onChange={e => {
                                  onUpdate({
                                    ...config,
                                    sections: config.sections.map(s => s.id === section.id ? { ...s, themeColor: e.target.value } : s)
                                  });
                                }}
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-white/10 text-sm uppercase text-white font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Narrative Description</label>
                          <textarea 
                            rows={4}
                            value={section.content.description || ''} 
                            onChange={e => handleSectionContentUpdate(section.id, 'description', e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 ring-white/10 text-sm text-white leading-relaxed"
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-500">Cinematic Background (MP4 URL)</label>
                          <div className="relative">
                            <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
                            <input 
                              type="text" 
                              value={section.backgroundVideo} 
                              onChange={e => {
                                onUpdate({
                                  ...config,
                                  sections: config.sections.map(s => s.id === section.id ? { ...s, backgroundVideo: e.target.value } : s)
                                });
                              }}
                              className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 outline-none focus:ring-2 ring-white/10 text-sm text-white"
                            />
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
            <div className="max-w-2xl space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white/[0.03] border border-white/10 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                <div className="flex items-center gap-4 text-indigo-400">
                  <div className="p-3 bg-indigo-500/10 rounded-2xl">
                    <Database size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-playful tracking-tight uppercase text-white">Cloud Integration</h3>
                    <p className="text-zinc-500 text-xs font-bold tracking-widest uppercase">Database Configuration</p>
                  </div>
                </div>
                
                <p className="text-zinc-400 text-sm leading-relaxed">
                  To persist your cinematic portfolio changes permanently, connect your Supabase project. Your configuration is currently using memory-based state.
                </p>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">Supabase URL</label>
                    <input 
                      type="text" 
                      value={sbUrl} 
                      onChange={e => setSbUrl(e.target.value)}
                      placeholder="https://your-project.supabase.co"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:ring-2 ring-white/20 text-sm text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-zinc-500">Public Anon Key</label>
                    <input 
                      type="password" 
                      value={sbKey} 
                      onChange={e => setSbKey(e.target.value)}
                      placeholder="your-anon-key"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 outline-none focus:ring-2 ring-white/20 text-sm text-white"
                    />
                  </div>
                </div>
                
                <button 
                  onClick={handleManualConnect}
                  className="w-full bg-white text-black py-5 rounded-2xl font-bold uppercase tracking-widest text-xs hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98]"
                >
                  <ExternalLink size={16} />
                  Establish Connection
                </button>
              </div>

              {errorMessage && (
                <div className="flex items-start gap-4 p-8 bg-red-500/10 border border-red-500/20 rounded-[3rem] text-red-400 shadow-lg">
                  <AlertCircle size={24} className="shrink-0" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold uppercase tracking-widest">Configuration Error</p>
                    <p className="text-sm opacity-80">{errorMessage}</p>
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
