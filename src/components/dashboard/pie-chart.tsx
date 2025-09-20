"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartStyle, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const description = "An interactive pie chart"

const desktopData = [
  { month: "january", desktop: 186, fill: "var(--color-january)" },
  { month: "february", desktop: 305, fill: "var(--color-february)" },
  { month: "march", desktop: 237, fill: "var(--color-march)" },
  { month: "april", desktop: 173, fill: "var(--color-april)" },
  { month: "may", desktop: 209, fill: "var(--color-may)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  desktop: {
    label: "Desktop",
  },
  mobile: {
    label: "Mobile",
  },
  january: {
    label: "January",
    color: "var(--chart-1)",
  },
  february: {
    label: "February",
    color: "var(--chart-2)",
  },
  march: {
    label: "March",
    color: "var(--chart-3)",
  },
  april: {
    label: "April",
    color: "var(--chart-4)",
  },
  may: {
    label: "May",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function DashboardPieChart() {
  const id = "pie-interactive"
  const [activeMonth, setActiveMonth] = React.useState(desktopData[0].month)

  const activeIndex = React.useMemo(() => desktopData.findIndex((item) => item.month === activeMonth), [activeMonth])
  const months = React.useMemo(() => desktopData.map((item) => item.month), [])

  return (
    <Card
      data-chart={id}
      className="relative overflow-hidden border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm"
    >
      <ChartStyle id={id} config={chartConfig} />
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
      <CardHeader className="relative flex-row items-start space-y-0 pb-4">
        <div className="grid gap-2">
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Interactive Pie Chart
          </CardTitle>
          <CardDescription className="text-muted-foreground">January - June 2024</CardDescription>
        </div>
        <Select value={activeMonth} onValueChange={setActiveMonth}>
          <SelectTrigger
            className="ml-auto h-9 w-[140px] rounded-xl border-border/50 bg-white/80 backdrop-blur-sm shadow-sm"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl border-border/50 bg-white/95 backdrop-blur-sm">
            {months.map((key) => {
              const config = chartConfig[key as keyof typeof chartConfig]

              if (!config) {
                return null
              }

              return (
                <SelectItem key={key} value={key} className="rounded-lg [&_span]:flex hover:bg-muted/50">
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-full shadow-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {config?.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="relative flex flex-1 justify-center pb-6">
        <ChartContainer id={id} config={chartConfig} className="mx-auto aspect-square w-full max-w-[320px]">
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel className="bg-white/95 backdrop-blur-sm border-border/50" />}
            />
            <Pie
              data={desktopData}
              dataKey="desktop"
              nameKey="month"
              innerRadius={70}
              strokeWidth={2}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 12} className="drop-shadow-lg" />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 28}
                    innerRadius={outerRadius + 16}
                    className="opacity-30"
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-4xl font-bold">
                          {desktopData[activeIndex].desktop.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 28} className="fill-muted-foreground text-sm">
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
