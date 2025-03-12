import { supabase } from "@/lib/supabase"

export interface UserProfile {
  id: string
  email: string
  username?: string
  avatarUrl?: string
  createdAt: string
}

// Check if we're using a mock environment
const isMockEnvironment = !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Mock user for development
const mockUser: UserProfile = {
  id: "mock-user-id",
  email: "user@example.com",
  username: "TestUser",
  avatarUrl: "https://via.placeholder.com/150",
  createdAt: new Date().toISOString()
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  if (isMockEnvironment) {
    console.log("Mock sign in:", email)
    return { user: mockUser }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  
  if (error) throw new Error(error.message)
  return data
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email: string, password: string) {
  if (isMockEnvironment) {
    console.log("Mock sign up:", email)
    return { user: mockUser }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  
  if (error) throw new Error(error.message)
  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (isMockEnvironment) {
    console.log("Mock sign out")
    return
  }

  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

/**
 * Get the current user
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  if (isMockEnvironment) {
    console.log("Mock get current user")
    return mockUser
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  // Get additional profile data from profiles table if needed
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()
    
  if (error && error.code !== "PGRST116") {
    // PGRST116 means no rows found, which is fine for new users
    throw new Error(error.message)
  }
  
  return {
    id: user.id,
    email: user.email || "",
    username: profile?.username,
    avatarUrl: profile?.avatar_url,
    createdAt: user.created_at,
  }
}

/**
 * Update user profile
 */
export async function updateProfile(profile: Partial<UserProfile>) {
  if (isMockEnvironment) {
    console.log("Mock update profile:", profile)
    return { ...mockUser, ...profile }
  }

  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error("User not authenticated")
  
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      username: profile.username,
      avatar_url: profile.avatarUrl,
      updated_at: new Date().toISOString(),
    })
    
  if (error) throw new Error(error.message)
  
  return getCurrentUser()
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string) {
  if (isMockEnvironment) {
    console.log("Mock reset password for:", email)
    return
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) throw new Error(error.message)
}

/**
 * Update password
 */
export async function updatePassword(password: string) {
  if (isMockEnvironment) {
    console.log("Mock update password")
    return
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) throw new Error(error.message)
} 