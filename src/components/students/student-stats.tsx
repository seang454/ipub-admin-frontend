import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Users, UserCheck, UserX, GraduationCap } from "lucide-react"

const stats = [
  {
    title: "Total Students",
    value: "150",
    icon: Users,
    iconColor: "text-blue-500",
  },
  {
    title: "Active Students",
    value: "120",
    icon: UserCheck,
    iconColor: "text-green-500",
  },
  {
    title: "Inactive Students",
    value: "30",
    icon: UserX,
    iconColor: "text-gray-500",
  },
  {
    title: "Graduating Students",
    value: "45",
    icon: GraduationCap,
    iconColor: "text-yellow-500",
  },
]

export function StudentStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 bg-white border-none shadow-none">
          <div className="flex justify-between">
            <div>
              <p className="text-md mb-2 font-medium text-primary">{stat.title}</p>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
            <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
          </div>
        </Card>
      ))}
    </div>
  )
}
