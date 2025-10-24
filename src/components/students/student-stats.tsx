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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 gap-1.5">
              <p className=" bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
                {stat.title}
              </p>
              <p className="bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm">
                {stat.value}
              </p>
              <div className="flex items-center gap-1">
                {stat.trend === "up" && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {stat.trend === "down" && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    stat.trend === "up" && "text-green-600",
                    stat.trend === "down" && "text-red-600",
                    stat.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-muted-foreground">
                  from last month
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <stat.icon className={cn("w-8 h-8", stat.iconColor)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
