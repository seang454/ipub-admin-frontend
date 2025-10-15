
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { FileText, FilePlus, Send, Clock, CheckCircle, XCircle } from "lucide-react"
import { Paper, PapersResponse } from "@/types/paperType/paperType"

const stats = [
  {
    title: "Total Papers",
    value: "25",
    icon: FileText,
    iconColor: "text-blue-600",
    bgColor: "p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
    borderColor: "border-blue-200",
  },
  {
    title: "Draft Papers",
    value: "3",
    icon: FilePlus,
    iconColor: "text-amber-600",
    bgColor: "p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
    borderColor: "border-amber-200",
  },
  {
    title: "Submitted",
    value: "12",
    icon: Send,
    iconColor: "text-indigo-600",
    bgColor: "p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
    borderColor: "border-indigo-200",
  },
  {
    title: "Under Review",
    value: "8",
    icon: Clock,
    iconColor: "text-orange-600",
    bgColor: "p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
    borderColor: "border-orange-200",
  },
  {
    title: "Approved",
    value: "9",
    icon: CheckCircle,
    iconColor: "text-emerald-600",
    bgColor: "p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
    borderColor: "border-emerald-200",
  },
  {
    title: "Rejected",
    value: "1",
    icon: XCircle,
    iconColor: "text-red-600",
    bgColor: "p-6 bg-card border-border shadow-sm hover:shadow-md transition-all duration-200 hover:bg-card/80 backdrop-blur-sm",
    borderColor: "border-red-200",
  },
]

export function PaperStats({papers}:{papers:PapersResponse}) {
  console.log('papers in stats:>> ', papers);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            " hover:-translate-y-1 cursor-pointer border-2",
            stat.bgColor,
            stat.borderColor,
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium mb-2 text-foreground">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
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
