"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ChevronRight, Home } from "lucide-react"

const data = {
  user: {
    name: "Admin User",
    email: "admin@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
}

export default function Breadcrumb() {
  const pathname = usePathname()
  const segments = pathname.split("/").filter(Boolean)

  return (
    <header className="flex items-center justify-between p-4 bg-gradient-to-r from-background via-card to-background border-b border-border/50 backdrop-blur-sm">
      <div className="flex items-center space-x-4">
        <SidebarTrigger className="hover:bg-muted/50 transition-colors duration-200" />

        <nav className="flex items-center space-x-1 text-sm">
          {/* Home link with icon */}
          <Link
            href="/"
            className="flex items-center space-x-1 px-3 py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            <span>Home</span>
          </Link>

          {/* Dynamic breadcrumb segments */}
          {segments.map((segment, idx) => {
            const href = "/" + segments.slice(0, idx + 1).join("/")
            const isLast = idx === segments.length - 1
            const displayName = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ")

            return (
              <div key={idx} className="flex items-center space-x-1">
                <ChevronRight className="w-4 h-4 text-muted-foreground/60" />
                <Link
                  href={href}
                  className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isLast
                      ? "text-primary bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {displayName}
                </Link>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Optional: Add user info or actions on the right */}
      <div className="flex items-center space-x-2">
        <div className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </header>
  )
}
