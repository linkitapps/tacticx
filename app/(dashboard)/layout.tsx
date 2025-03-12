import type React from "react"
import { SidebarWrapper } from "@/components/sidebar/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SidebarWrapper>{children}</SidebarWrapper>
}

