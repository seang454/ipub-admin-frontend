"use client";

import { Users, FileText, UserCheck, BookCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PapersResponse } from "@/types/paperType/paperType";
import type { User } from "@/types/userType/userType";

export interface DashboardStatsProps {
  papers: PapersResponse | undefined;
  user: User[] | undefined;
  students: User[];
  mentors: User[];
}
export function DashboardStats({
  papers,
  user,
  students,
  mentors,
}: DashboardStatsProps) {
  const stats = [
    {
      title: "Total Users",
      value: user?.length,
      icon: Users,
      iconColor: "text-primary",
      bgGradient: "from-primary/10 to-primary/5",
    },
    {
      title: "Total Papers",
      value: papers?.papers.content.length,
      icon: FileText,
      iconColor: "text-secondary",
      bgGradient: "from-secondary/10 to-secondary/5",
    },
    {
      title: "Total Students",
      value: students.length,
      icon: UserCheck,
      iconColor: "text-chart-2",
      bgGradient: "from-chart-2/10 to-chart-2/5",
    },
    {
      title: "Total Mentors",
      value: mentors.length,
      icon: BookCheck,
      iconColor: "text-chart-3",
      bgGradient: "from-chart-3/10 to-chart-3/5",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            "relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300",
            "bg-gradient-to-br",
            stat.bgGradient,
            "backdrop-blur-sm hover:scale-105"
          )}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-background/30 to-transparent" />
          <div className="relative p-4 sm:p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wide truncate">
                  {stat.title}
                </p>
                <p className="text-2xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {stat.value}
                </p>
              </div>
              <div
                className={cn(
                  "p-2 sm:p-2.5 md:p-3 rounded-xl bg-card/80 shadow-sm flex-shrink-0",
                  "ring-1 ring-border/20"
                )}
              >
                <stat.icon
                  className={cn(
                    "w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6",
                    stat.iconColor
                  )}
                />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
