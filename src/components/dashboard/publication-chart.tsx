"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { User } from "@/types/userType/userType"
import { useMemo } from "react"

export const description = "A line chart with dots (dark/light mode responsive)"

type CombinedData = { month: string; desktop: number }

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)", // uses Tailwind/shadcn theme color, auto changes in dark mode
  },
} satisfies ChartConfig

export function PdashboardLineChart({ mentors }: { mentors?: User[] }) {
  const combinedData: CombinedData[] = useMemo(() => {
    if (!mentors) return []

    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(2024, i, 1).toLocaleString("default", { month: "long" })
    )

    const monthCounts = mentors.reduce<Record<string, number>>((acc, mentor) => {
      const month = new Date(mentor.createDate).toLocaleString("default", { month: "long" })
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    return monthNames.reduce<CombinedData[]>((result, month, i) => {
      if (i % 2 === 0 && monthNames[i + 1]) {
        const label = `${month.slice(0, 3)}-${monthNames[i + 1].slice(0, 3)}`
        const count = (monthCounts[month] || 0) + (monthCounts[monthNames[i + 1]] || 0)
        result.push({ month: label, desktop: count })
      }
      return result
    }, [])
  }, [mentors])

  return (
    <Card className="relative overflow-hidden border border-border/50 shadow-md hover:shadow-lg transition-all duration-300 bg-card">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-primary">Line Chart – Total Mentors</CardTitle>
        <CardDescription className="text-muted-foreground">January – June 2024</CardDescription>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              aria-label="Mentors per month (line chart)"
              data={combinedData}
              margin={{ left: 12, right: 12 }}
            >
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                stroke="var(--muted-foreground)"
              />
              <ChartTooltip
                cursor={{ stroke: "var(--border)", strokeDasharray: "3 3" }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-popover/95 backdrop-blur-sm border border-border/50 shadow-lg"
                  />
                }
              />
              <Line
                dataKey="desktop"
                type="monotone"
                stroke={chartConfig.desktop.color}
                strokeWidth={3}
                dot={{
                  fill: chartConfig.desktop.color,
                  strokeWidth: 2,
                  stroke: "var(--background)",
                  r: 6,
                }}
                activeDot={{
                  r: 8,
                  stroke: chartConfig.desktop.color,
                  strokeWidth: 2,
                  fill: "var(--background)",
                }}
                className="drop-shadow-sm"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col items-start gap-2 text-sm border-t border-border/20 bg-muted/10">
        <div className="flex gap-2 font-semibold text-primary">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">Showing total mentors for the last 6 months</div>
      </CardFooter>
    </Card>
  )
}


// "use client"

// import { TrendingUp } from "lucide-react"
// import { CartesianGrid, Line, LineChart, XAxis, ResponsiveContainer } from "recharts"
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card"
// import {
//   type ChartConfig,
//   ChartContainer,
//   ChartTooltip,
//   ChartTooltipContent,
// } from "@/components/ui/chart"
// import type { User } from "@/types/userType/userType"
// import { useMemo } from "react"

// export const description = "A minimalist line chart (dark/light responsive)"

// type CombinedData = { month: string; desktop: number }

// const chartConfig = {
//   desktop: {
//     label: "Desktop",
//     color: "var(--chart-1)",
//   },
// } satisfies ChartConfig

// export function PdashboardLineChart({ mentors }: { mentors?: User[] }) {
//   const combinedData: CombinedData[] = useMemo(() => {
//     if (!mentors) return []

//     const monthNames = Array.from({ length: 12 }, (_, i) =>
//       new Date(2024, i, 1).toLocaleString("default", { month: "long" })
//     )

//     const monthCounts = mentors.reduce<Record<string, number>>((acc, mentor) => {
//       const month = new Date(mentor.createDate).toLocaleString("default", { month: "long" })
//       acc[month] = (acc[month] || 0) + 1
//       return acc
//     }, {})

//     return monthNames.reduce<CombinedData[]>((result, month, i) => {
//       if (i % 2 === 0 && monthNames[i + 1]) {
//         const label = `${month.slice(0, 3)}-${monthNames[i + 1].slice(0, 3)}`
//         const count = (monthCounts[month] || 0) + (monthCounts[monthNames[i + 1]] || 0)
//         result.push({ month: label, desktop: count })
//       }
//       return result
//     }, [])
//   }, [mentors])

//   return (
//     <Card className="overflow-hidden border-none bg-transparent"> {/* Removed borders/shadows for minimalism */}
//       <CardHeader className="pb-2">
//         <CardTitle className="text-base font-medium text-foreground">Total Mentors</CardTitle> {/* Simplified typography */}
//         <CardDescription className="text-sm text-muted-foreground">Jan – Jun 2024</CardDescription>
//       </CardHeader>

//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <ResponsiveContainer width="100%" height={200}> {/* Reduced height for compactness */}
//             <LineChart
//               aria-label="Mentors per month"
//               data={combinedData}
//               margin={{ left: 0, right: 0, top: 0, bottom: 0 }} {/* Minimal margins */}
//             >
//               <CartesianGrid vertical={false} stroke="var(--muted)" strokeOpacity={0.2} /> {/* Subtle grid */}
//               <XAxis
//                 dataKey="month"
//                 tickLine={false}
//                 axisLine={false}
//                 tickMargin={4}
//                 tickFormatter={(value) => value.slice(0, 3)}
//                 stroke="var(--muted-foreground)"
//                 className="text-xs"
//               />
//               <ChartTooltip
//                 cursor={{ stroke: "var(--muted)", strokeDasharray: "3 3" }}
//                 content={
//                   <ChartTooltipContent
//                     hideLabel
//                     className="bg-background border border-muted/50"
//                   />
//                 }
//               />
//               <Line
//                 dataKey="desktop"
//                 type="monotone"
//                 stroke={chartConfig.desktop.color}
//                 strokeWidth={2} {/* Thinner line */}
//                 dot={false} {/* Removed dots for cleaner look */}
//                 activeDot={{ r: 4, stroke: chartConfig.desktop.color, fill: "var(--background)" }}
//               />
//             </LineChart>
//           </ResponsiveContainer>
//         </ChartContainer>
//       </CardContent>

//       <CardFooter className="flex-col items-start gap-1 text-xs text-muted-foreground pt-2 border-t-0"> {/* No border */}
//         <div className="flex gap-1 font-medium text-foreground">
//           Up 5.2% this month <TrendingUp className="h-3 w-3" />
//         </div>
//         <div>Last 6 months</div>
//       </CardFooter>
//     </Card>
//   )
// }