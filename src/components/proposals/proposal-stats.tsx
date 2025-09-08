import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react"

const stats = [
  {
    title: "Total Proposals",
    value: "25",
    icon: FileText,
    iconColor: "text-blue-500",
  },
  {
    title: "Approved Proposals",
    value: "12",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  {
    title: "Rejected Proposals",
    value: "8",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  {
    title: "Pending Proposals",
    value: "5",
    icon: Clock,
    iconColor: "text-yellow-500",
  },
]

export function ProposalStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="p-6 bg-white border border-gray-200">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-md font-medium text-muted">{stat.title}</p>
              <p className="text-3xl font-bold text-primary">{stat.value}</p>
            </div>
            <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
          </div>
        </Card>
      ))}
    </div>
  )
}
