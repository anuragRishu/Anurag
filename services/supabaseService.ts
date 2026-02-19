
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteConfig } from '../types';

// Hardcoded credentials provided by the user
const HARDCODED_URL = 'https://byqvbgwjfhqvqmebcjky.supabase.co';
const HARDCODED_KEY = 'sb_publishable_r4N8VSAzk0S8_PdZYlVYCg_4dAv_1LW';

const getSafeEnv = (key: string): string => {
  const prefixes = ['', 'VITE_', 'REACT_APP_'];
  try {
    if (typeof process !== 'undefined' && process.env) {
      for (const p of prefixes) {
        const val = (process.env as any)[p + key];
        if (val) return val;
      }
    }
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        for (const p of prefixes) {
          const val = (import.meta as any).env[p + key];
          if (val) return val;
        }
      }
    } catch (e) {}
    const g = (globalThis as any);
    for (const p of prefixes) {
      if (g && g[p + key]) return g[p + key];
    }
  } catch (err) {}
  return '';
};

const URL_KEY = 'vivid_motion_sb_url';
const ANON_KEY = 'vivid_motion_sb_key';

let supabaseInstance: SupabaseClient | null = null;

const initClient = () => {
  // If already initialized and we aren't explicitly resetting, return existing
  if (supabaseInstance) return supabaseInstance;

  const url = getSafeEnv('SUPABASE_URL') || 
              (typeof localStorage !== 'undefined' ? localStorage.getItem(URL_KEY) : '') || 
              HARDCODED_URL;
              
  const key = getSafeEnv('SUPABASE_ANON_KEY') || 
              (typeof localStorage !== 'undefined' ? localStorage.getItem(ANON_KEY) : '') || 
              HARDCODED_KEY;

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      console.log('Supabase client initialized.');
    } catch (err) {
      console.error('Supabase init error:', err);
      supabaseInstance = null;
    }
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
