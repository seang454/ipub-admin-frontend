import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { FileText, FilePlus, Send, Clock, CheckCircle, XCircle } from "lucide-react"

const stats = [
  {
    title: "Total Papers",
    value: "25",
    icon: FileText,
    iconColor: "text-blue-600",
    bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
  },
  {
    title: "Draft Papers",
    value: "3",
    icon: FilePlus,
    iconColor: "text-amber-600",
    bgColor: "bg-gradient-to-br from-amber-50 to-amber-100",
    borderColor: "border-amber-200",
  },
  {
    title: "Submitted",
    value: "12",
    icon: Send,
    iconColor: "text-indigo-600",
    bgColor: "bg-gradient-to-br from-indigo-50 to-indigo-100",
    borderColor: "border-indigo-200",
  },
  {
    title: "Under Review",
    value: "8",
    icon: Clock,
    iconColor: "text-orange-600",
    bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
    borderColor: "border-orange-200",
  },
  {
    title: "Approved",
    value: "9",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgColor: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    borderColor: "border-emerald-200",
  },
  {
    title: "Rejected",
    value: "1",
    icon: XCircle,
    iconColor: "text-red-600",
    bgColor: "bg-gradient-to-br from-red-50 to-red-100",
    borderColor: "border-red-200",
  },
]

export function PaperStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            "p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2",
            stat.bgColor,
            stat.borderColor,
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
            </div>
            <div
              className={cn(
                "p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-sm",
                "flex items-center justify-center",
              )}
            >
              <stat.icon className={cn("w-6 h-6", stat.iconColor)} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
