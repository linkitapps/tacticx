import { create } from "zustand"
import { supabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  error: null,

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error
      set({ user: data.user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      set({ user: data.user, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  signInWithGoogle: async () => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      // User will be set after redirect
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  signOut: async () => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({ user: null, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  resetPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null })
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
}))

// Initialize auth state
export const initializeAuth = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  useAuthStore.setState({
    user: session?.user || null,
    isLoading: false,
  })

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((event, session) => {
    useAuthStore.setState({
      user: session?.user || null,
      isLoading: false,
    })
  })
}

