"use client"

import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "A line chart with dots"

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function PdashboardLineChart() {
  return (
    <Card className="relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
      <CardHeader className="relative">
        <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Line Chart - Dots
        </CardTitle>
        <CardDescription className="text-muted-foreground">January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.3} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              className="text-muted-foreground"
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent hideLabel className="bg-white/95 backdrop-blur-sm border-border/50 shadow-lg" />
              }
            />
            <Line
              dataKey="desktop"
              type="natural"
              stroke="var(--color-desktop)"
              strokeWidth={3}
              dot={{
                fill: "var(--color-desktop)",
                strokeWidth: 2,
                stroke: "white",
                r: 6,
              }}
              activeDot={{
                r: 8,
                stroke: "var(--color-desktop)",
                strokeWidth: 2,
                fill: "white",
              }}
              className="drop-shadow-sm"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="relative flex-col items-start gap-3 text-sm border-t border-border/20 bg-muted/20">
        <div className="flex gap-2 leading-none font-semibold text-primary">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">Showing total visitors for the last 6 months</div>
      </CardFooter>
    </Card>
  )
}
