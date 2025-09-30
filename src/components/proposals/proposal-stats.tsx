import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { FileText, FilePlus, Send, Clock, CheckCircle, XCircle } from "lucide-react"

const stats = [
  {
    title: "Total Papers",
    value: "25",
    icon: FileText,
    iconColor: "text-blue-600 dark:text-blue-400",
    bgColor: "bg-gradient-to-br from-blue-50/80 to-blue-100/80 dark:from-blue-950/50 dark:to-blue-900/50",
    borderColor: "border-blue-200/50 dark:border-blue-800/50",
  },
  {
    title: "Draft Papers",
    value: "3",
    icon: FilePlus,
    iconColor: "text-amber-600 dark:text-amber-400",
    bgColor: "bg-gradient-to-br from-amber-50/80 to-amber-100/80 dark:from-amber-950/50 dark:to-amber-900/50",
    borderColor: "border-amber-200/50 dark:border-amber-800/50",
  },
  {
    title: "Submitted",
    value: "12",
    icon: Send,
    iconColor: "text-indigo-600 dark:text-indigo-400",
    bgColor: "bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 dark:from-indigo-950/50 dark:to-indigo-900/50",
    borderColor: "border-indigo-200/50 dark:border-indigo-800/50",
  },
  {
    title: "Under Review",
    value: "8",
    icon: Clock,
    iconColor: "text-orange-600 dark:text-orange-400",
    bgColor: "bg-gradient-to-br from-orange-50/80 to-orange-100/80 dark:from-orange-950/50 dark:to-orange-900/50",
    borderColor: "border-orange-200/50 dark:border-orange-800/50",
  },
  {
    title: "Approved",
    value: "9",
    icon: CheckCircle,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    bgColor: "bg-gradient-to-br from-emerald-50/80 to-emerald-100/80 dark:from-emerald-950/50 dark:to-emerald-900/50",
    borderColor: "border-emerald-200/50 dark:border-emerald-800/50",
  },
  {
    title: "Rejected",
    value: "1",
    icon: XCircle,
    iconColor: "text-red-600 dark:text-red-400",
    bgColor: "bg-gradient-to-br from-red-50/80 to-red-100/80 dark:from-red-950/50 dark:to-red-900/50",
    borderColor: "border-red-200/50 dark:border-red-800/50",
  },
]

export function PaperStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            "p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-2 backdrop-blur-xl",
            stat.bgColor,
            stat.borderColor,
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{stat.value}</p>
            </div>
            <div
              className={cn(
                "p-3 rounded-full bg-white/80 dark:bg-black/20 backdrop-blur-sm shadow-lg",
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
