"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { User } from "@/types/userType/userType"

export const description = "A bar chart with a custom label"

const chartConfig = {
  users: {
    label: "users",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig

export function ChartBarLabelCustom({ users }: { users: User[] | undefined }) {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  // generate 2-month combined chart data
  const chartData = []
  for (let i = 0; i < 12; i += 2) {
    const monthLabel = `${months[i]}-${months[i + 1]}`
    const month1Str = (i + 1).toString().padStart(2, "0") // "01"
    const month2Str = (i + 2).toString().padStart(2, "0") // "02"

    const usersInMonth1 = users?.filter((u) => u.createDate.startsWith(`2025-${month1Str}-`)) ?? []
    const usersInMonth2 = users?.filter((u) => u.createDate.startsWith(`2025-${month2Str}-`)) ?? []

    chartData.push({
      month: monthLabel,
      users: usersInMonth1.length + usersInMonth2.length,
    })
  }

  return (
    <Card className="relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card via-card/80 to-muted/20 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-background/10 to-transparent pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold text-primary">Bar Chart - Total Users</CardTitle>
        <CardDescription className="text-muted-foreground">January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} stroke="var(--border)" strokeOpacity={0.3} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
              hide
            />
            <XAxis dataKey="users" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  className="bg-popover/95 backdrop-blur-sm border-border/50 shadow-lg"
                />
              }
            />
            <Bar dataKey="users" layout="vertical" fill="var(--color-users)" radius={8} className="drop-shadow-sm">
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-primary-foreground font-medium"
                fontSize={12}
              />
              <LabelList
                dataKey="users"
                position="right"
                offset={8}
                className="fill-foreground font-medium"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="relative flex-col items-start gap-3 text-sm border-t border-border/20 bg-muted/10">
        <div className="flex gap-2 leading-none font-semibold text-primary">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
      </CardFooter>
    </Card>
  )
}
