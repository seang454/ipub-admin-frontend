import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  TrendingDown,
  GraduationCap,
} from "lucide-react";

const stats = [
  {
    title: "Total Students",
    value: "1,234",
    change: "+12%",
    trend: "up",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Active Students",
    value: "1,180",
    change: "+8%",
    trend: "up",
    icon: UserCheck,
    iconColor: "text-green-500",
  },
  {
    title: "Inactive Students",
    value: "54",
    change: "-4%",
    trend: "down",
    icon: UserX,
    iconColor: "text-muted-foreground",
  },
  {
    title: "Graduates",
    value: "892",
    change: "+0%",
    trend: "neutral",
    icon: GraduationCap,
    iconColor: "text-purple-500",
  },
];

export function StudentStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-4 sm:p-5 md:p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {stat.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">
                {stat.value}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                {stat.trend === "up" && (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                )}
                {stat.trend === "down" && (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                )}
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium",
                    stat.trend === "up" && "text-green-600",
                    stat.trend === "down" && "text-red-600",
                    stat.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                  from last month
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <stat.icon
                className={cn(
                  "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8",
                  stat.iconColor
                )}
              />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
