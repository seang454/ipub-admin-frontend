"use client";
import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  GraduationCap,
  LucideIcon,
} from "lucide-react";
import { UsersResponse } from "@/types/userType/userType";

interface StatItem {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: LucideIcon;
  iconVar: string;
}

const stats: StatItem[] = [
  {
    title: "Total Advisor",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    iconVar: "--primary",
  },
  {
    title: "Active Advisor",
    value: "1,180",
    change: "+8%",
    trend: "up",
    icon: UserCheck,
    iconVar: "--success",
  },
  {
    title: "Inactive Advisor",
    value: "54",
    change: "-4%",
    trend: "down",
    icon: UserX,
    iconVar: "--muted-foreground",
  },
  {
    title: "Senior Advisor",
    value: "892",
    change: "+0%",
    trend: "neutral",
    icon: GraduationCap,
    iconVar: "--secondary",
  },
];

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export default function AdviserStats({
  advisers,
}: {
  advisers: UsersResponse | undefined;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.title}
            className="p-4 sm:p-5 md:p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs sm:text-sm font-medium mb-1 truncate"
                  style={{
                    color: "var(--muted-foreground, var(--foreground))",
                  }}
                >
                  {stat.title}
                </p>

                <p
                  className="text-xl sm:text-2xl font-bold mb-2"
                  style={{ color: "var(--card-foreground)" }}
                >
                  {stat.value}
                </p>

                <div className="flex items-center gap-1 flex-wrap">
                  {stat.trend === "up" && (
                    <TrendingUp
                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                      style={{ color: "var(--success, #16a34a)" }}
                    />
                  )}
                  {stat.trend === "down" && (
                    <TrendingDown
                      className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                      style={{ color: "var(--destructive, #ef4444)" }}
                    />
                  )}

                  <span
                    className={cn(
                      "text-xs sm:text-sm font-medium",
                      stat.trend === "up" && "text-[var(--success,#16a34a)]",
                      stat.trend === "down" &&
                        "text-[var(--destructive,#ef4444)]",
                      stat.trend === "neutral" &&
                        "text-[var(--muted-foreground,#6b7280)]"
                    )}
                  >
                    {stat.change}
                  </span>

                  <span
                    className="text-xs sm:text-sm hidden sm:inline"
                    style={{ color: "var(--muted-foreground,#6b7280)" }}
                  >
                    from last month
                  </span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Icon
                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8"
                  style={{
                    color: `var(${stat.iconVar || "--primary"})`,
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
