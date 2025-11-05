/**
 * SUPABASE CLIENT - DATABASE CONNECTION
 *
 * Purpose:
 * - Creates and exports Supabase client instance
 * - Connects to Supabase PostgreSQL database
 * - Provides database access for all services
 *
 * Dependencies:
 * - @supabase/supabase-js: Official Supabase client library
 *
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous/public API key
 *
 * Database Connection:
 * - URL: https://bhbktgiiusxmosjtqopu.supabase.co
 * - Uses anonymous authentication (no user auth required)
 * - Access controlled by Row Level Security (RLS) policies
 *
 * Usage:
 * - Import `supabase` from this file to make database calls
 * - Used by DatabaseService for all CRUD operations
 *
 * Notes:
 * - Client is singleton (created once)
 * - Throws error if env variables missing
 * - Safe to use anon key (client-side public key)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
