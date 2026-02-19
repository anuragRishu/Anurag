
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SiteConfig } from '../types';

// Keys storage names
const URL_KEY = 'vivid_motion_sb_url';
const ANON_KEY = 'vivid_motion_sb_key';

// Internal state for the client
let supabaseInstance: SupabaseClient | null = null;

/**
 * Attempts to initialize the Supabase client using env vars or localStorage.
 */
const initClient = () => {
  const url = (process.env as any).SUPABASE_URL || localStorage.getItem(URL_KEY) || '';
  const key = (process.env as any).SUPABASE_ANON_KEY || localStorage.getItem(ANON_KEY) || '';

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

// Initial setup
initClient();

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
  localStorage.setItem(URL_KEY, url);
  localStorage.setItem(ANON_KEY, key);
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
