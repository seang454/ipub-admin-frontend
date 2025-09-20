"use client"

import type * as React from "react"
import { Home, Users, Shield, BookCheckIcon, UserCheck, GraduationCap, BookText } from "lucide-react"
import { NavMain } from "@/components/sidebar/nav-main"
import { NavUser } from "@/components/sidebar/nav-user"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin User",
    email: "admin@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
      isActive: true,
    },
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Papers",
      url: "/papers",
      icon: BookCheckIcon,
    },
    {
      title: "Advisers",
      url: "/advisers",
      icon: UserCheck,
    },
    {
      title: "Students",
      url: "/students",
      icon: GraduationCap,
    },
    {
      title: "Proposals",
      url: "/proposals",
      icon: BookText,
    },
  ],
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="border-none bg-sidebar font-medium text-sidebar-foreground shadow-lg"
    >
      <SidebarHeader>
        <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-sidebar-primary/10 to-sidebar-accent/10 rounded-lg mx-2 mt-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-sidebar-accent text-sidebar-primary-foreground shadow-lg">
            <Shield className="h-5 w-5" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className="truncate font-bold text-lg text-sidebar-foreground">Admin Panel</span>
            <span className="truncate text-sm text-sidebar-foreground/70">Management System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2">
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="px-2 pb-4">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
