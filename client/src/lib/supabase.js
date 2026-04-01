import { createClient } from '@supabase/supabase-js'

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
let supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Prevent crash if user hasn't replaced the .env placeholders yet
if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn("⚠️ Invalid or missing Supabase URL in .env. Using placeholder.");
  supabaseUrl = 'https://placeholder.supabase.co';
}

if (!supabaseAnonKey || supabaseAnonKey.includes('YOUR_')) {
  console.warn("⚠️ Missing Supabase anon key in .env.");
  supabaseAnonKey = 'placeholder_key';
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
