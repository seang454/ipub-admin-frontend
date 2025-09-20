"use client"

import { cn } from "@/lib/utils"

interface LoadingDotsProps {
  className?: string
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow"></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: "0.2s" }}></div>
      <div className="w-2 h-2 bg-primary rounded-full animate-pulse-slow" style={{ animationDelay: "0.4s" }}></div>
    </div>
  )
}
