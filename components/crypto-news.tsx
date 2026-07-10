"use client"

import React, { useEffect, useState } from "react"
import useSWR from "swr"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, Clock, Filter } from "lucide-react"

interface EconomicEvent {
  title: string
  country: string
  date: string
  impact: "High" | "Medium" | "Low"
  forecast: string
  previous: string
  actual: string
  unit: string
}

type ImpactFilter = "all" | "high"
type CurrencyFilter = "all" | "USD" | "EUR" | "GBP" | "JPY"

// Fetcher untuk SWR
const fetcher = (url: string) => fetch(url).then((r) => r.json())

// Warna badge per mata uang
const CURRENCY_BADGE: Record<string, string> = {
  USD: "bg-blue-950/70 text-blue-300 border-blue-700/50",
  EUR: "bg-indigo-950/70 text-indigo-300 border-indigo-700/50",
  GBP: "bg-teal-950/70 text-teal-300 border-teal-700/50",
  JPY: "bg-orange-950/70 text-orange-300 border-orange-700/50",
}

// Komponen indikator impact — gaya Forex Factory
function ImpactBullets({ impact }: { impact: "High" | "Medium" | "Low" }) {
  const levels: Array<"High" | "Medium" | "Low"> = ["Low", "Medium", "High"]
  const currentIndex = levels.indexOf(impact)

  const colorMap: Record<string, string> = {
    High: "bg-red-500",
    Medium: "bg-amber-500",
    Low: "bg-yellow-400",
  }
  const filledColor = colorMap[impact]

  return (
    <div className="flex items-center gap-0.5" title={`Impact: ${impact}`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i <= currentIndex ? filledColor : "bg-zinc-700"
          }`}
        />
      ))}
    </div>
  )
}

// Badge untuk nilai actual vs forecast (bullish/bearish)
function ActualBadge({
  actual,
  forecast,
  previous,
  unit,
}: {
  actual: string
  forecast: string
  previous: string
  unit: string
}) {
  if (!actual) return null

  const actualNum = parseFloat(actual)
  const forecastNum = parseFloat(forecast)
  const prevNum = parseFloat(previous)

  let sentiment: "bullish" | "bearish" | "neutral" = "neutral"

  if (!isNaN(actualNum) && !isNaN(forecastNum)) {
    if (actualNum > forecastNum) sentiment = "bullish"
    else if (actualNum < forecastNum) sentiment = "bearish"
  } else if (!isNaN(actualNum) && !isNaN(prevNum)) {
    if (actualNum > prevNum) sentiment = "bullish"
    else if (actualNum < prevNum) sentiment = "bearish"
  }

  const sentimentLabel = {
    bullish: "▲ USD+",
    bearish: "▼ USD−",
    neutral: "● Netral",
  }

  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Badge
        variant="outline"
        className={`text-[10px] font-bold h-4 px-1.5 ${
          sentiment === "bullish"
            ? "bg-emerald-950/70 text-emerald-400 border-emerald-700/50"
            : sentiment === "bearish"
            ? "bg-red-950/70 text-red-400 border-red-700/50"
            : "bg-zinc-800/70 text-zinc-300 border-zinc-600/50"
        }`}
      >
        {sentimentLabel[sentiment]}
      </Badge>
      <span className="text-[10px] text-zinc-300 font-mono font-semibold">
        {actual}{unit}
      </span>
    </div>
  )
}

// Format tanggal lokal Indonesia
function formatDateGroup(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  })
}

// Format jam ke WIB
function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Jakarta",
  })
}

// Cek apakah event sudah lewat
function isPast(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

// Countdown timer untuk next High Impact event
function CountdownTimer({ events }: { events: EconomicEvent[] }) {
  const [timeStr, setTimeStr] = useState("")
  const [nextTitle, setNextTitle] = useState("")

  useEffect(() => {
    const update = () => {
      const upcoming = events
        .filter((e) => e.impact === "High" && !isPast(e.date))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      const next = upcoming[0] || null

      if (!next) {
        setTimeStr("")
        setNextTitle("")
        return
      }

      setNextTitle(next.title.length > 22 ? next.title.slice(0, 22) + "…" : next.title)

      const diff = new Date(next.date).getTime() - Date.now()
      if (diff <= 0) {
        setTimeStr("Berlangsung")
        return
      }

      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)

      if (h >= 24) {
        const d = Math.floor(h / 24)
        setTimeStr(`${d}h ${h % 24}j`)
      } else if (h > 0) {
        setTimeStr(`${h}j ${m}m`)
      } else {
        setTimeStr(`${m}m ${s}d`)
      }
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [events])

  if (!timeStr) return null

  return (
    <div className="flex items-center gap-1.5">
      <Clock className="h-2.5 w-2.5 text-red-400 shrink-0" />
      <span className="text-[10px] text-zinc-500 hidden sm:inline">Next High:</span>
      <span
        className="text-[10px] text-red-400 font-mono font-semibold tabular-nums"
        title={nextTitle}
      >
        {timeStr}
      </span>
    </div>
  )
}

export function CryptoNews({
  showCountdown = false,
  defaultFilter = "all",
}: {
  showCountdown?: boolean
  defaultFilter?: ImpactFilter
}) {
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [impactFilter, setImpactFilter] = useState<ImpactFilter>(defaultFilter)
  const [currencyFilter, setCurrencyFilter] = useState<CurrencyFilter>("all")

  // SWR: auto-refresh setiap 5 menit
  const { data, error, isLoading, mutate } = useSWR(
    "/api/economic-calendar",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 menit
      revalidateOnFocus: true,
      onSuccess: (data) => {
        setLastUpdated(new Date())
        setIsDemoMode(data?.source === "demo")
      },
    }
  )

  const allEvents: EconomicEvent[] = data?.events || []

  // Deteksi mata uang yang tersedia di data
  const availableCurrencies = Array.from(
    new Set(allEvents.map((e) => e.country))
  ).filter((c) => ["USD", "EUR", "GBP", "JPY"].includes(c)) as CurrencyFilter[]

  // Terapkan filter
  const filteredEvents = allEvents.filter((e) => {
    const impactOk = impactFilter === "all" || e.impact === "High"
    const currencyOk = currencyFilter === "all" || e.country === currencyFilter
    return impactOk && currencyOk
  })

  // Kelompokkan event berdasarkan tanggal lokal WIB
  const grouped: Record<string, EconomicEvent[]> = {}
  filteredEvents.forEach((e) => {
    const dateKey = formatDateGroup(e.date)
    if (!grouped[dateKey]) grouped[dateKey] = []
    grouped[dateKey].push(e)
  })

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-xs">Memuat kalender ekonomi...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 px-4 text-center">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-xs text-red-400">Gagal memuat data.</span>
        <button
          onClick={() => mutate()}
          className="text-xs text-zinc-400 hover:text-zinc-200 underline"
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">

      {/* Status Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-800/30 border-b border-zinc-800/50 shrink-0">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {isDemoMode ? (
            <span className="text-[10px] text-amber-400/80 font-medium truncate">
              ⚠️ Demo Mode
            </span>
          ) : (
            <>
              {showCountdown && allEvents.length > 0 && (
                <CountdownTimer events={allEvents} />
              )}
              {!showCountdown && (
                <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  Update tiap 5 menit
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {lastUpdated && (
            <span className="text-[10px] text-zinc-600 font-mono hidden sm:block">
              {lastUpdated.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={() => mutate()}
            title="Refresh sekarang"
            className="text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Filter Bar: Impact + Currency */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-zinc-800/30 shrink-0 flex-wrap">

        {/* Impact filter */}
        <div className="flex items-center gap-1">
          <Filter className="h-2.5 w-2.5 text-zinc-600" />
          {(["all", "high"] as ImpactFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setImpactFilter(f)}
              className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-all ${
                impactFilter === f
                  ? f === "high"
                    ? "bg-red-500/20 text-red-400 border border-red-500/40"
                    : "bg-zinc-700/60 text-zinc-200 border border-zinc-600/50"
                  : "text-zinc-600 hover:text-zinc-400 border border-transparent"
              }`}
            >
              {f === "all" ? "All" : "High ▲"}
            </button>
          ))}
        </div>

        <div className="w-px h-3 bg-zinc-800/80" />

        {/* Currency filter */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setCurrencyFilter("all")}
            className={`text-[10px] px-1.5 py-0.5 rounded font-medium transition-all border ${
              currencyFilter === "all"
                ? "bg-zinc-700/60 text-zinc-200 border-zinc-600/50"
                : "text-zinc-600 hover:text-zinc-400 border-transparent"
            }`}
          >
            All
          </button>
          {(["USD", "EUR", "GBP", "JPY"] as const).map((c) => {
            const isAvailable = availableCurrencies.includes(c)
            const isActive = currencyFilter === c
            return (
              <button
                key={c}
                onClick={() => isAvailable && setCurrencyFilter(c)}
                disabled={!isAvailable}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold transition-all border ${
                  isActive
                    ? `${CURRENCY_BADGE[c]}`
                    : isAvailable
                    ? "text-zinc-500 hover:text-zinc-300 border-transparent hover:border-zinc-700/50"
                    : "text-zinc-800 border-transparent cursor-default"
                }`}
              >
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 px-3 py-1 border-b border-zinc-800/30 shrink-0">
        {[
          { label: "High", color: "bg-red-500" },
          { label: "Med", color: "bg-amber-500" },
          { label: "Low", color: "bg-yellow-400" },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1">
            <div className={`h-2 w-2 rounded-full ${color}`} />
            <span className="text-[10px] text-zinc-500">{label}</span>
          </div>
        ))}
        <div className="ml-auto text-[10px] text-zinc-600">WIB (UTC+7)</div>
      </div>

      {/* Event List */}
      {Object.keys(grouped).length === 0 ? (
        <div className="flex items-center justify-center h-24 text-xs text-zinc-500">
          Tidak ada event yang sesuai filter.
        </div>
      ) : (
        <ScrollArea className="flex-1 min-h-0">
          <div className="flex flex-col">
            {Object.entries(grouped).map(([dateLabel, dayEvents]) => (
              <div key={dateLabel}>
                {/* Header Tanggal */}
                <div className="sticky top-0 z-10 px-3 py-1.5 bg-zinc-900/95 backdrop-blur-sm border-y border-zinc-800/60">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
                    {dateLabel}
                  </span>
                </div>

                {/* Events */}
                {dayEvents.map((event, idx) => {
                  const past = isPast(event.date)
                  const isHigh = event.impact === "High"
                  return (
                    <div
                      key={idx}
                      className={`relative px-3 py-2.5 flex items-start gap-2.5 border-b border-zinc-800/40 transition-colors ${
                        past
                          ? "opacity-45 hover:opacity-60"
                          : isHigh
                          ? "high-impact-row hover:bg-red-950/10"
                          : "hover:bg-zinc-800/30"
                      }`}
                    >
                      {/* Waktu */}
                      <div className="w-10 shrink-0 pt-0.5 text-center">
                        <span className="text-[11px] font-mono text-zinc-500">
                          {formatTime(event.date)}
                        </span>
                      </div>

                      {/* Impact Dots */}
                      <div className="shrink-0 pt-1">
                        <ImpactBullets impact={event.impact} />
                      </div>

                      {/* Currency Badge */}
                      <div className="shrink-0 pt-0.5">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-1 h-4 tracking-wider rounded ${
                            CURRENCY_BADGE[event.country] ||
                            "bg-zinc-700/40 text-zinc-300 border-zinc-600/50"
                          }`}
                        >
                          {event.country}
                        </Badge>
                      </div>

                      {/* Nama Event + Data */}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium leading-snug ${
                            isHigh ? "text-zinc-100" : "text-zinc-300"
                          }`}
                        >
                          {event.title}
                        </p>

                        {/* Forecast / Previous */}
                        {(event.forecast || event.previous) && (
                          <div className="flex gap-3 mt-0.5">
                            {event.forecast && (
                              <span className="text-[10px] text-zinc-500">
                                F:{" "}
                                <span className="text-zinc-400 font-medium font-mono">
                                  {event.forecast}{event.unit}
                                </span>
                              </span>
                            )}
                            {event.previous && (
                              <span className="text-[10px] text-zinc-500">
                                P:{" "}
                                <span className="text-zinc-400 font-medium font-mono">
                                  {event.previous}{event.unit}
                                </span>
                              </span>
                            )}
                          </div>
                        )}

                        {/* Actual + Sentiment */}
                        <ActualBadge
                          actual={event.actual}
                          forecast={event.forecast}
                          previous={event.previous}
                          unit={event.unit}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
