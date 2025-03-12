import { create } from "zustand"
import { StateCreator } from "zustand"
import { 
  getCurrentUser, 
  resetPassword, 
  signInWithEmail, 
  signOut, 
  signUpWithEmail, 
  updatePassword,
  updateProfile,
  UserProfile 
} from "@/lib/services/auth"

interface AuthState {
  user: UserProfile | null
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>
  resetUserPassword: (email: string) => Promise<void>
  updateUserPassword: (password: string) => Promise<void>
  clearError: () => void
}

interface AuthStore extends AuthState, AuthActions {}

type AuthStoreCreator = StateCreator<AuthStore>

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,

  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      await signInWithEmail(email, password)
      const user = await getCurrentUser()
      set({ user, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  signUp: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null })
      await signUpWithEmail(email, password)
      const user = await getCurrentUser()
      set({ user, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  logout: async () => {
    try {
      set({ isLoading: true, error: null })
      await signOut()
      set({ user: null, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  checkAuth: async () => {
    try {
      set({ isLoading: true, error: null })
      const user = await getCurrentUser()
      set({ user, isLoading: false })
    } catch (error) {
      set({ user: null, error: (error as Error).message, isLoading: false })
    }
  },

  updateUserProfile: async (profile: Partial<UserProfile>) => {
    try {
      set({ isLoading: true, error: null })
      const updatedUser = await updateProfile(profile)
      set({ user: updatedUser, isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  resetUserPassword: async (email: string) => {
    try {
      set({ isLoading: true, error: null })
      await resetPassword(email)
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  updateUserPassword: async (password: string) => {
    try {
      set({ isLoading: true, error: null })
      await updatePassword(password)
      set({ isLoading: false })
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false })
    }
  },

  clearError: () => set({ error: null }),
})) 