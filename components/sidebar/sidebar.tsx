"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, PlusCircle, Settings, User, FileText, LogOut, Menu, ChevronLeft, Layers, Share2 } from "lucide-react"

import { Logo } from "@/components/ui/logo"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/useAuthStore"

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 transition-all duration-200 ease-in-out">
          <div className="container mx-auto p-4">
            <div className="flex items-center mb-6">
              <SidebarTrigger className="mr-4 md:hidden">
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
              <div className="md:hidden">
                <Logo size="sm" />
              </div>
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function AppSidebar() {
  const pathname = usePathname()
  const { signOut } = useAuthStore()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname.startsWith(path)) return true
    return false
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/editor", label: "New Tactic", icon: PlusCircle },
    { href: "/tactics", label: "My Tactics", icon: Layers },
    { href: "/shared", label: "Shared Tactics", icon: Share2 },
    { href: "/docs", label: "Documentation", icon: FileText },
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <Sidebar variant="floating" className="border-r border-border/40">
      <SidebarHeader className="py-4">
        <div className="flex items-center justify-between px-4">
          <Logo />
          <Button variant="ghost" size="icon" className="hidden md:flex" asChild>
            <SidebarTrigger>
              <ChevronLeft className="h-5 w-5" />
            </SidebarTrigger>
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={isActive(item.href)} tooltip={item.label}>
                <Link href={item.href} className="flex items-center">
                  <item.icon className="mr-3 h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="mt-auto">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/profile")} tooltip="Profile">
              <Link href="/profile" className="flex items-center">
                <User className="mr-3 h-5 w-5" />
                <span>Profile</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings">
              <Link href="/settings" className="flex items-center">
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              tooltip="Sign Out"
              className="text-red-500 hover:text-red-600 hover:bg-red-100/10"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

