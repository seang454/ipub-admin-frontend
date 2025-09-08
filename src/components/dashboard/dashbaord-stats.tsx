import { Users, FileText, UserCheck, BookCheck } from "lucide-react"
import { Card } from "../ui/card"
import { cn } from "@/lib/utils"

export function DashboardStats() {
  const stats = [
    {
      title: "Total Users",
      value: "278",
      icon: Users,
      iconColor: "text-blue-500",
    },
    {
      title: "Papers",
      value: "234",
      icon: FileText,
      iconColor: "text-gray-600",
    },
    {
      title: "Active Users",
      value: "156",
      icon: UserCheck,
      iconColor: "text-green-500",
    },
    {
      title: "Publications",
      value: "24",  
      icon: BookCheck,
      iconColor: "text-purple-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-4 bg-white border-none shadow-none">
          <div className="flex justify-between">
            <div>
              <p className="text-md mb-2 font-medium text-primary">{stat.title}</p>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
            <stat.icon className={cn("w-4 h-4", stat.iconColor)} />
          </div>
        </Card>
      ))}
    </div>
  )
}
