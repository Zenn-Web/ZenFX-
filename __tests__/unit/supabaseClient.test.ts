import { supabase, signInWithGoogle } from "@/lib/supabaseClient"

describe("Supabase Client Initialization", () => {
  it("initializes supabase client without throwing", () => {
    expect(supabase).toBeDefined()
    expect(typeof supabase.auth.signInWithPassword).toBe("function")
    expect(typeof supabase.auth.signUp).toBe("function")
    expect(typeof supabase.auth.signInWithOAuth).toBe("function")
    expect(typeof signInWithGoogle).toBe("function")
  })
})
