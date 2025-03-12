import { createClient } from "@supabase/supabase-js"

// Get environment variables or use fallback values for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zdvdpkioccaxnjgsyxmp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key'

// Create the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Log initialization status
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn(
      'Using fallback Supabase credentials. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local for proper functionality.'
    )
  } else {
    console.log('Supabase client initialized with environment variables')
  }
}

