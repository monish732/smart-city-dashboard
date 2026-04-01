const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

let supabaseUrl = process.env.SUPABASE_URL;
let supabaseKey = process.env.SUPABASE_ANON_KEY;
let supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if(!supabaseUrl || !supabaseUrl.startsWith('http')) {
  console.warn("⚠️ Invalid or missing Supabase URL in server/.env. Using placeholder.");
  supabaseUrl = 'https://placeholder.supabase.co';
}

if(!supabaseKey || supabaseKey.includes('YOUR_')) {
  supabaseKey = 'placeholder_key';
}

const supabase = createClient(supabaseUrl, supabaseKey);
const supabaseAdmin = createClient(
  supabaseUrl,
  !supabaseServiceRoleKey || supabaseServiceRoleKey.includes('YOUR_')
    ? supabaseKey
    : supabaseServiceRoleKey,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

module.exports = { supabase, supabaseAdmin };
