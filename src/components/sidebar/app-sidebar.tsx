"use client";

import type * as React from "react";
import {
  Home,
  Users,
  Shield,
  BookCheckIcon,
  UserCheck,
  GraduationCap,
  BookText,
  Sun,
  Moon,
  BellIcon,
} from "lucide-react";
import { NavMain } from "@/components/sidebar/nav-main";
import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useTheme } from "next-themes";

const data = {
  user: {
    name: "Admin User",
    email: "admin@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
  navMain: [
    { title: "Dashboard", url: "/dashboard", icon: Home, isActive: true },
    { title: "Users", url: "/users", icon: Users },
    { title: "Papers", url: "/papers", icon: BookCheckIcon },
    { title: "Advisers", url: "/advisers", icon: UserCheck },
    { title: "Students", url: "/students", icon: GraduationCap },
    { title: "Proposals", url: "/proposals", icon: BookText },
    { title: "Notification", url: "/notification", icon: BellIcon },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar
      collapsible="offcanvas"
      {...props}
      className="
        bg-card border-border shadow-lg backdrop-blur-sm
      "
    >
      {/* Header */}
      <SidebarHeader className="border-b border-border/50">
        <div className="flex items-center justify-between px-4 py-4 bg-gradient-to-r from-secondary/10 to-secondary/5 rounded-lg mx-2 my-2">
          {/* Logo */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-white shadow-lg">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="grid flex-1 text-left leading-tight min-w-0">
              <span className="truncate font-bold text-base text-foreground">
                Admin Panel
              </span>
              <span className="truncate text-xs text-muted-foreground">
                Management System
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-secondary/20 transition-colors flex-shrink-0"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-foreground" />
            )}
          </button>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-3 py-2">
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-3 py-3 border-t border-border/50">
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
