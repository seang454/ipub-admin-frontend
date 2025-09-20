"use client"

import { Users, FileText, UserCheck, BookCheck } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function DashboardStats() {
  const stats = [
    {
      title: "Total Users",
      value: 1247,
      icon: Users,
      iconColor: "text-primary",
      bgGradient: "from-primary/10 to-primary/5",
    },
    {
      title: "Total Papers",
      value: 89,
      icon: FileText,
      iconColor: "text-secondary",
      bgGradient: "from-secondary/10 to-secondary/5",
    },
    {
      title: "Total Students",
      value: 892,
      icon: UserCheck,
      iconColor: "text-chart-2",
      bgGradient: "from-chart-2/10 to-chart-2/5",
    },
    {
      title: "Total Mentors",
      value: 45,
      icon: BookCheck,
      iconColor: "text-chart-3",
      bgGradient: "from-chart-3/10 to-chart-3/5",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            "relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-br",
            stat.bgGradient,
            "backdrop-blur-sm hover:scale-105",
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent" />
          <div className="relative p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.title}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
              <div className={cn("p-3 rounded-xl bg-white/80 shadow-sm", "ring-1 ring-border/20")}>
                <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
