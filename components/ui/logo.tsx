import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

export function Logo({ size = "md", className }: LogoProps) {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
    xl: "text-3xl",
  }

  return (
    <span
      className={cn("font-bold text-foreground/90", sizeClasses[size], className)}
    >
      tacticx.app
    </span>
  )
}

