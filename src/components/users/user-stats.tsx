import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { User } from "@/types/userType/userType";
import { useEffect, useState } from "react";

const stats = [
  {
    title: "Total Users",
    value: "4",
    change: "+12%",
    trend: "up",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Active Users",
    value: "2",
    change: "+8%",
    trend: "up",
    icon: UserCheck,
    iconColor: "text-green-500",
  },
  {
    title: "Inactive Users",
    value: "2",
    change: "-4%",
    trend: "down",
    icon: UserX,
    iconColor: "text-muted-foreground",
  },
  {
    title: "Admin Users",
    value: "1",
    change: "+0%",
    trend: "neutral",
    icon: Shield,
    iconColor: "text-purple-500",
  },
];

export function UserStats({ allUsers }: { allUsers: User[] | undefined }) {
  const [active, setActive] = useState<User[]>([]);
  const [inactive, setInactive] = useState<User[]>([]);
  const [admin, setAdmin] = useState<User[]>([]);

  useEffect(() => {
    if (allUsers) {
      const admins = allUsers.filter((u) => {
        return u.isAdmin === false;
      });
      const activeusre = allUsers.filter((u) => {
        return u.isActive;
      });
      setAdmin(admins);
      setActive(activeusre);
      console.log("admins filtered :>> ", admins); // correct immediately
    }
  }, [allUsers]);

  console.log("users in firt fetch :>> ", allUsers);
  console.log("admin :>> ", admin);
  console.log("active :>> ", active);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-4 sm:p-5 md:p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1 truncate">
                {stat.title}
              </p>
              <p className="text-xl sm:text-2xl font-bold text-foreground mb-2">
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
