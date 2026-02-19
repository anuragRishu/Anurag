
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteConfig } from '../types';

/**
 * Safely access environment variables across different runtimes/build-tools.
 * Prevents "ReferenceError: process is not defined" in production builds.
 */
const getSafeEnv = (key: string): string => {
  try {
    // Check if we are in a browser environment
    const isBrowser = typeof window !== 'undefined';
    
    // 1. Try process.env (Standard Node/Webpack/CRA)
    // We use a window check to avoid crashing in environments where 'process' is a strictly guarded global
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
    
    // 2. Try import.meta.env (Vite)
    // Wrap in try-catch as some bundlers fail during parsing of 'import.meta'
    try {
      if (typeof import.meta !== 'undefined' && (import.meta as any).env) {
        return (import.meta as any).env[key] || '';
      }
    } catch (e) {}

    // 3. Fallback to global search if injected via script or other means
    const g = (globalThis as any);
    if (g && g[key]) return g[key];
    
  } catch (err) {
    console.warn(`Environment check failed for key: ${key}`, err);
  }
  return '';
};

// Keys storage names
const URL_KEY = 'vivid_motion_sb_url';
const ANON_KEY = 'vivid_motion_sb_key';

// Internal state for the client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Attempts to initialize the Supabase client using env vars or localStorage.
 */
const initClient = () => {
  const url = getSafeEnv('SUPABASE_URL') || (typeof localStorage !== 'undefined' ? localStorage.getItem(URL_KEY) : '') || '';
  const key = getSafeEnv('SUPABASE_ANON_KEY') || (typeof localStorage !== 'undefined' ? localStorage.getItem(ANON_KEY) : '') || '';

  if (url && key) {
    try {
      supabaseInstance = createClient(url, key);
      console.log('Supabase client initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      supabaseInstance = null;
    }
  } else {
    supabaseInstance = null;
  }
  return supabaseInstance;
};

// Initial setup (Browser only or with safe checks)
if (typeof window !== 'undefined') {
  initClient();
}

export const supabase = () => supabaseInstance;

const CONFIG_TABLE = 'portfolio_configs';
const SINGLETON_ID = 1;

export interface ConfigResponse {
  config: SiteConfig;
  updatedAt: string;
}

/**
 * Manually update keys and re-initialize the client.
 */
export const updateSupabaseConnection = (url: string, key: string) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(URL_KEY, url);
    localStorage.setItem(ANON_KEY, key);
  }
  return initClient();
};

/**
 * Checks if Supabase is properly configured.
 */
export const isSupabaseConnected = (): boolean => {
  return !!supabaseInstance;
};

/**
 * Fetches the site configuration and timestamp from Supabase.
 */
export const fetchSiteConfig = async (): Promise<ConfigResponse | null> => {
  const client = supabase();
  if (!client) {
    console.warn('Supabase fetch skipped: No credentials provided.');
    return null;
  }

  try {
    const { data, error } = await client
      .from(CONFIG_TABLE)
      .select('config, updated_at')
      .eq('id', SINGLETON_ID)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No existing config found in Supabase.');
        return null;
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

/**
 * Saves the site configuration to Supabase.
 */
export const saveSiteConfig = async (config: SiteConfig): Promise<{success: boolean, error?: string}> => {
  const client = supabase();
  if (!client) {
    return { 
      success: false, 
      error: 'Supabase credentials missing. Please set them in the Connection tab.' 
    };
  }

  try {
    const { error } = await client
      .from(CONFIG_TABLE)
      .upsert({ id: SINGLETON_ID, config }, { onConflict: 'id' });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error('Supabase Save Error:', err.message || err);
    return { 
      success: false, 
      error: err.message || 'Failed to save. Ensure the "portfolio_configs" table exists.' 
    };
  }
};
