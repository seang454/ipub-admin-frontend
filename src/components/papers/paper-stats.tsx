import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX, Shield } from "lucide-react"

const stats = [
  {
    title: "Total Papers",
    value: "25",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Total Draft",
    value: "3",
    icon: UserCheck,
    iconColor: "text-green-500",
  },
  {
    title: "Total Submitted",
    value: "12",
    icon: UserX,
    iconColor: "text-gray-500",
  },
  {
    title: "Total Review",
    value: "1",
    icon: Shield,
    iconColor: "text-gray-700",    
  },
  {
    title: "Total Approved",
    value: "1",
    icon: Shield,
    iconColor: "text-gray-700",
  },
  {
    title: "Total Rejected",
    value: "1",
    icon: Shield,
    iconColor: "text-red-700",
  },
]

export function PaperStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 bg-white border-none shadow-none">
          <div className="flex justify-between">
            <div>
              <p className="text-sm mb-2 font-medium text-muted">{stat.title}</p>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
            <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
          </div>
        </Card>
      ))}
    </div>
  )
}
