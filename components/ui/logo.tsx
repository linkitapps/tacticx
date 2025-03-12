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
      className={cn("font-spaceGrotesk font-black tracking-tight text-white", sizeClasses[size], className)}
      style={{
        fontVariant: "normal",
        letterSpacing: "0.03em",
        textShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
      }}
    >
      tacticx.app
    </span>
  )
}

