import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ddsrgwmlzjkswxyzkqxd.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkc3Jnd21semprc3d4eXprcXhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNTI2ODgsImV4cCI6MjEwMDgyODY4OH0.Mcp7Zpv1_zIgEjs5MDblti5vzKW8gzGCUFLS08RX63A'

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
