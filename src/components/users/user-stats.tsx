import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX, Shield, TrendingUp, TrendingDown } from "lucide-react"

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
    iconColor: "text-gray-500",
  },
  {
    title: "Admin Users",
    value: "1",
    change: "+0%",
    trend: "neutral",
    icon: Shield,
    iconColor: "text-purple-500",
  },
]

export function UserStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-6 bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</p>
              <div className="flex items-center gap-1">
                {stat.trend === "up" && <TrendingUp className="w-4 h-4 text-green-500" />}
                {stat.trend === "down" && <TrendingDown className="w-4 h-4 text-red-500" />}
                <span
                  className={cn(
                    "text-sm font-medium",
                    stat.trend === "up" && "text-green-600",
                    stat.trend === "down" && "text-red-600",
                    stat.trend === "neutral" && "text-gray-500",
                  )}
                >
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500">from last month</span>
              </div>
            </div>
            <div className="flex-shrink-0">
              <stat.icon className={cn("w-8 h-8", stat.iconColor)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
