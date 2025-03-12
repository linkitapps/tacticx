import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  return NextResponse.json({
    envVarsExist: {
      supabaseUrl: !!supabaseUrl,
      supabaseKey: !!supabaseKey
    },
    supabaseUrl: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : null,
    supabaseKey: supabaseKey ? supabaseKey.substring(0, 10) + '...' : null
  });
} 