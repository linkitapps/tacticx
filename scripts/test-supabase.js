// Simple script to test Supabase connection
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Anon Key (first 10 chars):', supabaseAnonKey?.substring(0, 10) + '...');

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  try {
    // Test 1: Basic connection test - list tables
    console.log('\nTest 1: Listing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .limit(5);
    
    if (tablesError) {
      console.error('Error listing tables:', tablesError);
    } else {
      console.log('Tables found:', tables.length);
      console.log('Table names:', tables.map(t => t.table_name).join(', '));
    }

    // Test 2: Check if tactics table exists
    console.log('\nTest 2: Checking tactics table...');
    try {
      const { data: tactics, error: tacticsError } = await supabase
        .from('tactics')
        .select('id')
        .limit(1);
      
      if (tacticsError) {
        if (tacticsError.code === 'PGRST204') {
          console.error('Error: Tactics table does not exist');
        } else if (tacticsError.code === '42501') {
          console.error('Error: Unauthorized access to tactics table. Check RLS policies.');
        } else {
          console.error('Error accessing tactics table:', tacticsError);
        }
      } else {
        console.log('Successfully accessed tactics table!');
        console.log('Number of tactics found:', tactics.length);
      }
    } catch (err) {
      console.error('Exception when accessing tactics table:', err);
    }

    // Test 3: Test auth status
    console.log('\nTest 3: Checking auth status...');
    const { data: authData } = await supabase.auth.getSession();
    console.log('Auth session:', authData?.session ? 'Active' : 'None');
    
  } catch (error) {
    console.error('General connection error:', error);
  }
}

testConnection(); 