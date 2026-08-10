import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hjpcmlhmoxhymstdtnve.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqcGNtbGhtb3hoeW1zdGR0bnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU4NDQyNjEsImV4cCI6MjEwMTQyMDI2MX0.0bXaMlSt5q6hD-YulSjw8giLjBd3qm__zMt3oqQMJc4"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Helper function to sign in with Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: typeof window !== "undefined" ? window.location.origin : undefined,
    },
  })
  return { data, error }
}
