#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Error: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function main() {
  // accept email and password as CLI args, or env vars, or fall back to defaults
  const cliEmail = process.argv[2];
  const cliPassword = process.argv[3];
  const email = cliEmail || process.env.SUPABASE_NEW_USER_EMAIL || 'corneluisgroup@gmail.com';
  const password = cliPassword || process.env.SUPABASE_NEW_USER_PASSWORD || 'KceS@920531';
  const platformId = process.argv[4] || process.env.SUPABASE_NEW_USER_PLATFORM || null;
  const role = process.argv[5] || process.env.SUPABASE_NEW_USER_ROLE || 'superadmin';
  const fullName = process.argv[6] || process.env.SUPABASE_NEW_USER_FULL_NAME || 'Super Admin';
  const email_confirm = true; // auto confirm user

  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm,
    });

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    console.log('User created:', data);

    // Attempt to create a user_profiles row linked to the auth user (service role key required)
    const userId = (data && (data.user?.id || data.id)) || null;
    if (userId) {
      const profile = {
        user_id: userId,
        platform_id: platformId,
        full_name: fullName,
        email,
        role,
        status: 'Active',
        password_note: 'Created via script',
      };

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .insert(profile);

      if (profileError) {
        console.error('Failed to create user_profiles row:', profileError);
      } else {
        console.log('User profile created:', profileData);
      }
    } else {
      console.warn('No user id returned from auth creation; skipping profile insert.');
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

main();
