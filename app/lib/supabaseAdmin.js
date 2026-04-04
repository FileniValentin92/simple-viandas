import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn(
    '[supabaseAdmin] Missing SUPABASE_SERVICE_ROLE_KEY — admin writes will fail. ' +
    'Add it to .env.local and Vercel env vars.'
  )
}

// Service-role client bypasses RLS — use ONLY in server-side API routes
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null
