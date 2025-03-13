"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/useAuthStore"
// Import the Logo component
import { Logo } from "@/components/ui/logo"

export function MainNav() {
  const pathname = usePathname()
  const { user, signOut } = useAuthStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const closeMenu = () => {
    setIsMenuOpen(false)
  }

  const handleSignOut = async () => {
    await signOut()
    closeMenu()
  }

  const routes = [
    {
      href: "/",
      label: "Home",
      active: pathname === "/",
    },
    {
      href: "/editor",
      label: "Editor",
      active: pathname === "/editor",
    }
  ]

  const authRoutes = user
    ? [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname === "/dashboard",
        },
        {
          href: "/profile",
          label: "Profile",
          active: pathname === "/profile",
        },
      ]
    : []

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Replace the app name link with our Logo component */}
        <Link href="/" className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center space-x-6 md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm transition-colors hover:text-primary ${
                route.active ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}

          {authRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={`text-sm transition-colors hover:text-primary ${
                route.active ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {route.label}
            </Link>
          ))}

          {user && (
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMenu}>
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="container mx-auto p-4 md:hidden">
          <div className="flex flex-col space-y-4">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={closeMenu}
                className={`text-sm transition-colors hover:text-primary ${
                  route.active ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}

            {authRoutes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                onClick={closeMenu}
                className={`text-sm transition-colors hover:text-primary ${
                  route.active ? "text-primary font-medium" : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}

            {user && (
              <Button variant="ghost" onClick={handleSignOut} className="justify-start px-0">
                Sign Out
              </Button>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

