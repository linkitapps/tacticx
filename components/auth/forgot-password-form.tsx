"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuthStore } from "@/store/useAuthStore"

interface ForgotPasswordFormValues {
  email: string
}

export function ForgotPasswordForm() {
  const { resetPassword, error, isLoading, clearError } = useAuthStore()
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>()

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    await resetPassword(data.email)
    if (!error) {
      setSubmitted(true)
      toast.success("Password reset email sent!")
    }
  }

  // Clear any previous errors when form is interacted with
  const handleFormInteraction = () => {
    if (error) clearError()
  }

  if (submitted) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-semibold">Check your email</h3>
        <p className="mt-2 text-muted-foreground">We&apos;ve sent you a link to reset your password.</p>
        <Button asChild className="mt-4">
          <Link href="/login">Back to login</Link>
        </Button>
      </div>
    )
  }

  return (
    <div onChange={handleFormInteraction} onClick={handleFormInteraction}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="coach@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
          />
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  )
}

