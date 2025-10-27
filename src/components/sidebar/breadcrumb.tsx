"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ChevronRight, Home } from "lucide-react";

const data = {
  user: {
    name: "Admin User",
    email: "admin@company.com",
    avatar: "/placeholder.svg?height=32&width=32",
  },
};

export default function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="flex items-center justify-between p-2 sm:p-3 md:p-4 bg-card border-b border-border/50 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-1 min-w-0">
        <SidebarTrigger className="hover:bg-muted/50 transition-colors duration-200 flex-shrink-0" />

        <nav className="flex items-center space-x-1 text-xs sm:text-sm overflow-x-auto flex-1 min-w-0 scrollbar-hide">
          {/* Home link with icon */}
          <Link
            href="/"
            className="flex items-center space-x-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-200 group flex-shrink-0"
          >
            <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform duration-200" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          {/* Dynamic breadcrumb segments */}
          {segments.map((segment, idx) => {
            const href = "/" + segments.slice(0, idx + 1).join("/");
            const isLast = idx === segments.length - 1;
            const displayName =
              segment.charAt(0).toUpperCase() +
              segment.slice(1).replace(/-/g, " ");

            return (
              <div
                key={idx}
                className="flex items-center space-x-1 flex-shrink-0"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/60" />
                <Link
                  href={href}
                  className={`px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 truncate max-w-[120px] sm:max-w-none ${
                    isLast
                      ? "bg-primary/10 border border-primary/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  {displayName}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Optional: Add user info or actions on the right */}
      <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
        <div className="text-xs text-muted-foreground">
          {new Date().toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </div>
      </div>
    </header>
  );
}
