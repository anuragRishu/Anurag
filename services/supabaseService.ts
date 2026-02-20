
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteConfig } from '../types';

// Hardcoded credentials - set to empty to force environment or UI configuration
const HARDCODED_URL = '';
const HARDCODED_KEY = '';

const getSafeEnv = (key: string): string => {
  // Standard Vite environment variable access
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const val = import.meta.env[`VITE_${key}`];
    if (val) return val;
  }
  
  // Fallback for other environments
  try {
    if (typeof process !== 'undefined' && process.env) {
      const val = process.env[`VITE_${key}`] || process.env[key];
      if (val) return val;
    }
  } catch (e) {}
  
  return '';
};

const URL_KEY = 'vivid_motion_sb_url';
const ANON_KEY = 'vivid_motion_sb_key';

let supabaseInstance: SupabaseClient | null = null;

const initClient = () => {
  // If already initialized, return existing
  if (supabaseInstance) return supabaseInstance;

  const url = getSafeEnv('SUPABASE_URL') || 
              (typeof localStorage !== 'undefined' ? localStorage.getItem(URL_KEY) : '') || 
              HARDCODED_URL;
              
  const key = getSafeEnv('SUPABASE_ANON_KEY') || 
              (typeof localStorage !== 'undefined' ? localStorage.getItem(ANON_KEY) : '') || 
              HARDCODED_KEY;

  if (!url || !key || url === 'https://your-project-id.supabase.co' || key.includes('your-anon-key')) {
    console.warn('Supabase credentials missing or using placeholders.');
    return null;
  }

  try {
    supabaseInstance = createClient(url, key);
    console.log('Supabase client initialized.');
  } catch (err) {
    console.error('Supabase init error:', err);
    supabaseInstance = null;
  }
  
  return supabaseInstance;
};

// Singleton access
export const supabase = () => {
  if (!supabaseInstance) return initClient();
  return supabaseInstance;
};

const CONFIG_TABLE = 'portfolio_configs';
const SINGLETON_ID = 1;

export interface ConfigResponse {
  config: SiteConfig;
  updatedAt: string;
}

export const updateSupabaseConnection = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(URL_KEY, url);
    localStorage.setItem(ANON_KEY, key);
  }
  // Clear instance so next call to supabase() re-initializes with new keys
  supabaseInstance = null;
  return initClient();
};

export const isSupabaseConnected = (): boolean => {
  return !!supabaseInstance || (!!HARDCODED_URL && !!HARDCODED_KEY);
};

export const fetchSiteConfig = async (): Promise<ConfigResponse | null> => {
  const client = supabase();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from(CONFIG_TABLE)
      .select('config, updated_at')
      .eq('id', SINGLETON_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      if (error.message?.includes('Unregistered API key')) {
        throw new Error('Invalid Supabase API Key. Please check your credentials in the Studio Cloud settings.');
      }
      throw error;
    }
    return {
      config: data.config as SiteConfig,
      updatedAt: data.updated_at
    };
  } catch (err: any) {
    console.error('Supabase Fetch Error:', err.message || err);
    return null;
  }
};

export const saveSiteConfig = async (config: SiteConfig): Promise<{success: boolean, error?: string}> => {
  const client = supabase();
  if (!client) return { success: false, error: 'Database not initialized.' };

  try {
    const { error } = await client
      .from(CONFIG_TABLE)
      .upsert({ id: SINGLETON_ID, config, updated_at: new Date().toISOString() }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase Save Error:', err.message || err);
    return { success: false, error: err.message || 'Failed to save configuration.' };
  }
};
