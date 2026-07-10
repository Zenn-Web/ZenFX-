"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { month: "January", desktop: 186, mobile: 80, tablet: 45 },
  { month: "February", desktop: 305, mobile: 200, tablet: 90 },
  { month: "March", desktop: 237, mobile: 120, tablet: 75 },
  { month: "April", desktop: 73, mobile: 190, tablet: 60 },
  { month: "May", desktop: 209, mobile: 130, tablet: 110 },
  { month: "June", desktop: 214, mobile: 140, tablet: 95 },
  { month: "July", desktop: 340, mobile: 280, tablet: 150 },
  { month: "August", desktop: 290, mobile: 220, tablet: 130 },
  { month: "September", desktop: 310, mobile: 250, tablet: 140 },
  { month: "October", desktop: 420, mobile: 310, tablet: 180 },
  { month: "November", desktop: 380, mobile: 290, tablet: 170 },
  { month: "December", desktop: 480, mobile: 390, tablet: 220 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "oklch(0.609 0.126 221.723)", // Sleek Blue/Indigo
  },
  mobile: {
    label: "Mobile",
    color: "oklch(0.645 0.246 16.439)", // Sleek Coral/Red
  },
  tablet: {
    label: "Tablet",
    color: "oklch(0.707 0.165 141.516)", // Sleek Emerald/Green
  },
} satisfies ChartConfig

export function DashboardChart() {
  const [chartType, setChartType] = React.useState<"area" | "bar" | "line">("area")
  const [timeframe, setTimeframe] = React.useState<"all" | "h2" | "q4">("all")

  const filteredData = React.useMemo(() => {
    if (timeframe === "h2") {
      return chartData.slice(6) // July to Dec
    }
    if (timeframe === "q4") {
      return chartData.slice(9) // Oct to Dec
    }
    return chartData
  }, [timeframe])

  const totals = React.useMemo(() => {
    return filteredData.reduce(
      (acc, curr) => {
        acc.desktop += curr.desktop
        acc.mobile += curr.mobile
        acc.tablet += curr.tablet
        return acc
      },
      { desktop: 0, mobile: 0, tablet: 0 }
    )
  }, [filteredData])

  return (
    <Card className="w-full border border-zinc-200/80 bg-white shadow-xs dark:border-zinc-800/80 dark:bg-zinc-950/40 backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300">
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b border-zinc-100 p-0 dark:border-zinc-800/80 sm:flex-row">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5.5 sm:py-6">
          <CardTitle className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Analisis Trafik Platform
          </CardTitle>
          <CardDescription className="text-sm text-zinc-500 dark:text-zinc-400">
            Visualisasi data pengunjung berdasarkan tipe perangkat
          </CardDescription>
        </div>
        <div className="flex border-t border-zinc-100 dark:border-zinc-800/80 sm:border-t-0 sm:border-l">
          <div className="flex items-center gap-2 px-6 py-4 sm:py-0">
            <div className="flex items-center rounded-lg bg-zinc-100 p-1 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850">
              <button
                onClick={() => setChartType("area")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  chartType === "area"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Area
              </button>
              <button
                onClick={() => setChartType("bar")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  chartType === "bar"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Bar
              </button>
              <button
                onClick={() => setChartType("line")}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  chartType === "line"
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-white"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                Line
              </button>
            </div>

            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as any)}
              className="rounded-lg border border-zinc-200 bg-white px-2.5 py-1 text-xs font-medium text-zinc-700 outline-none hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-850"
            >
              <option value="all">Semua Bulan</option>
              <option value="h2">Semester 2 (Jul - Des)</option>
              <option value="q4">Kuartal 4 (Okt - Des)</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-2 pt-6 sm:px-6 sm:pt-8">
        <div className="grid grid-cols-3 gap-4 mb-6 px-4">
          <div className="flex flex-col justify-center gap-1 border-r border-zinc-100 dark:border-zinc-800/60 pr-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold dark:text-zinc-500">
              Total Desktop
            </span>
            <span className="text-xl font-bold leading-none text-zinc-900 dark:text-zinc-50 tabular-nums">
              {totals.desktop.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-1 border-r border-zinc-100 dark:border-zinc-800/60 px-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold dark:text-zinc-500">
              Total Mobile
            </span>
            <span className="text-xl font-bold leading-none text-zinc-900 dark:text-zinc-50 tabular-nums">
              {totals.mobile.toLocaleString()}
            </span>
          </div>
          <div className="flex flex-col justify-center gap-1 pl-2">
            <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold dark:text-zinc-500">
              Total Tablet
            </span>
            <span className="text-xl font-bold leading-none text-zinc-900 dark:text-zinc-50 tabular-nums">
              {totals.tablet.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="h-[350px] w-full">
          <ChartContainer config={chartConfig} className="h-full w-full aspect-auto">
            {chartType === "area" ? (
              <AreaChart
                data={filteredData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <defs>
                  <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-desktop)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-mobile)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-mobile)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                  <linearGradient id="fillTablet" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-tablet)"
                      stopOpacity={0.4}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-tablet)"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="tablet"
                  type="natural"
                  fill="url(#fillTablet)"
                  stroke="var(--color-tablet)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="mobile"
                  type="natural"
                  fill="url(#fillMobile)"
                  stroke="var(--color-mobile)"
                  strokeWidth={2}
                  stackId="a"
                />
                <Area
                  dataKey="desktop"
                  type="natural"
                  fill="url(#fillDesktop)"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  stackId="a"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </AreaChart>
            ) : chartType === "bar" ? (
              <BarChart
                data={filteredData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dashed" />}
                />
                <Bar
                  dataKey="desktop"
                  fill="var(--color-desktop)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="mobile"
                  fill="var(--color-mobile)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="tablet"
                  fill="var(--color-tablet)"
                  radius={[4, 4, 0, 0]}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </BarChart>
            ) : (
              <LineChart
                data={filteredData}
                margin={{
                  left: 12,
                  right: 12,
                  top: 12,
                  bottom: 12,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => value.slice(0, 3)}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="desktop"
                  type="monotone"
                  stroke="var(--color-desktop)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="mobile"
                  type="monotone"
                  stroke="var(--color-mobile)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="tablet"
                  type="monotone"
                  stroke="var(--color-tablet)"
                  strokeWidth={2}
                  dot={false}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </LineChart>
            )}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}
