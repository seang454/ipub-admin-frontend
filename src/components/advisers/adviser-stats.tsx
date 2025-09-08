import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX, Shield } from "lucide-react"

const stats = [
  {
    title: "Total Advisers",
    value: "5",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Active Advisers",
    value: "3",
    icon: UserCheck,
    iconColor: "text-green-500",
  },
  {
    title: "Inactive Advisers",
    value: "1",
    icon: UserX,
    iconColor: "text-gray-500",
  },
  {
    title: "Senior Advisers",
    value: "1",
    icon: Shield,
    iconColor: "text-gray-700",
  },
]

export function AdviserStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 bg-white border-none shadow-none">
          <div className="flex justify-between">
            <div>
              <p className="text-md mb-2 font-medium text-muted">{stat.title}</p>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
            <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
          </div>
        </Card>
      ))}
    </div>
  )
}
