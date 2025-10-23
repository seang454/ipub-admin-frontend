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
    { title: "Notification", url: "/notification", icon: BellIcon}
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { theme, setTheme } = useTheme();

  return (
    <Sidebar
      collapsible="icon"
      {...props}
      className="
        bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm
      "
    >
      {/* Header */}
      <SidebarHeader>
        <div
          className="
            flex items-center justify-between px-4 py-4 mx-2 mt-2
            bg-secondary
            rounded-lg shadow-md
          "
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="
                flex h-10 w-10 items-center justify-center 
                rounded-xl 
                bg-secondary
                text-white shadow-lg
              "
            >
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="grid flex-1 text-left leading-tight">
              <span className="truncate font-bold text-lg text-white">Admin Panel</span>
              <span className="truncate text-sm text-white">
                Management System
              </span>
            </div>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        </div>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent className="px-2 mt-2">
        <NavMain
          items={data.navMain.map((item) => ({
            ...item,
            className: `
              flex items-center gap-3 px-3 py-2 rounded-lg
              transition-colors duration-200
              hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20
              ${
                item.isActive
                  ? "bg-indigo-500/10 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400"
                  : ""
              }
            `,
          }))}
        />
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="px-2 pb-4">
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
