"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, initializeAuth } from "@/store/useAuthStore"

// Initialize auth on first import
let initialized = false

export function useAuth(
  options: {
    required?: boolean
    redirectTo?: string
    redirectIfFound?: boolean
  } = {},
) {
  const router = useRouter()
  const { required = false, redirectTo = "/login", redirectIfFound = false } = options

  const { user, isLoading, error } = useAuthStore()

  useEffect(() => {
    if (!initialized) {
      initializeAuth()
      initialized = true
    }
  }, [])

  useEffect(() => {
    if (isLoading) return

    if (required && !user) {
      router.push(redirectTo)
    }

    if (redirectIfFound && user) {
      router.push(redirectTo)
    }
  }, [user, isLoading, required, redirectTo, redirectIfFound, router])

  return { user, isLoading, error }
}

