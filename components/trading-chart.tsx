"use client"

import React, { useEffect, useRef, useState, useCallback } from "react"
import {
  isForexMarketOpen,
  getActiveSessions,
  getNextMarketOpen,
  formatCountdown,
} from "@/lib/marketHours"

type Timeframe = "1H" | "4H" | "1D" | "1W"

const TIMEFRAME_MAP: Record<Timeframe, string> = {
  "1H": "60",
  "4H": "240",
  "1D": "D",
  "1W": "W",
}

const TIMEFRAME_LABELS: Record<Timeframe, string> = {
  "1H": "1 Jam",
  "4H": "4 Jam",
  "1D": "Harian",
  "1W": "Mingguan",
}

export function TradingChart() {
  const [timeframe, setTimeframe] = useState<Timeframe>("1D")
  const [loading, setLoading] = useState(true)
  const [marketOpen, setMarketOpen] = useState(true)
  const [sessions, setSessions] = useState<string[]>([])
  const [countdown, setCountdown] = useState("")
  const [now, setNow] = useState(new Date())

  // Update market status setiap menit
  useEffect(() => {
    const tick = () => {
      const current = new Date()
      setNow(current)
      setMarketOpen(isForexMarketOpen(current))
      setSessions(getActiveSessions(current))
      if (!isForexMarketOpen(current)) {
        const nextOpen = getNextMarketOpen(current)
        setCountdown(formatCountdown(nextOpen, current))
      }
    }

    tick()
    const interval = setInterval(tick, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const utcTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })

  const config = {
    autosize: true,
    symbol: "OANDA:XAUUSD",
    interval: TIMEFRAME_MAP[timeframe],
    timezone: "Asia/Jakarta",
    theme: "dark",
    style: "1",
    locale: "id",
    backgroundColor: "rgba(13, 17, 23, 0)",
    gridColor: "rgba(113, 113, 122, 0.08)",
    hide_top_toolbar: false,
    hide_legend: false,
    save_image: false,
    calendar: false,
    hide_volume: false,
    support_host: "https://www.tradingview.com",
    width: "100%",
    height: "100%",
  }

  const iframeSrc = `https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=id#${encodeURIComponent(
    JSON.stringify(config)
  )}`

  const handleTimeframeChange = (tf: Timeframe) => {
    if (tf === timeframe) return
    setLoading(true)   // tampilkan loading overlay saat iframe remount
    setTimeframe(tf)
  }

  return (
    <div className="relative h-full w-full flex flex-col bg-[#0D1117]">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-zinc-800/60 shrink-0 gap-4">
        {/* Symbol Info */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-tight">XAU / USD</span>
            <span className="text-xs text-zinc-500 font-mono">· Gold · OANDA</span>
          </div>

          {/* Market Status Badge */}
          <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
            marketOpen
              ? "bg-emerald-950/60 border-emerald-700/50 text-emerald-400"
              : "bg-red-950/60 border-red-700/50 text-red-400"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            {marketOpen ? "Market Open" : "Market Closed"}
          </div>

          {/* Active Sessions */}
          {marketOpen && sessions.length > 0 && (
            <div className="hidden md:flex items-center gap-1">
              {sessions.map((s) => (
                <span
                  key={s}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-700/40 text-amber-400/80 font-medium"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {/* Countdown jika closed */}
          {!marketOpen && countdown && (
            <span className="text-[11px] text-zinc-500">
              Buka dalam <span className="text-zinc-300 font-mono font-semibold">{countdown}</span>
            </span>
          )}
        </div>

        {/* Right: Timeframe Selector + UTC Clock */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-[11px] font-mono text-zinc-500 hidden sm:block">
            UTC {utcTime}
          </span>

          {/* Timeframe Buttons */}
          <div className="flex items-center rounded-lg border border-zinc-700/60 overflow-hidden bg-zinc-800/40">
            {(["1H", "4H", "1D", "1W"] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                  timeframe === tf
                    ? "bg-amber-500/20 text-amber-400 border-r border-amber-600/30 last:border-r-0"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/40 border-r border-zinc-700/40 last:border-r-0"
                }`}
                title={TIMEFRAME_LABELS[tf]}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Market Closed Banner */}
      {!marketOpen && (
        <div className="absolute top-[53px] left-0 right-0 z-20 flex items-center justify-center py-1.5 bg-red-950/80 backdrop-blur-sm border-b border-red-800/50">
          <span className="text-xs text-red-300 font-medium">
            ⚠️ Pasar ditutup saat ini — Chart menampilkan data terakhir.{" "}
            {countdown && `Buka kembali dalam ${countdown}.`}
          </span>
        </div>
      )}

      {/* TradingView Widget Container */}
      <div className="tradingview-widget-container flex-1 min-h-0 relative">

        {/* Loading overlay — tampil saat iframe sedang dimuat ulang */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0D1117] gap-3 pointer-events-none">
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-amber-500/60"
                  style={{
                    animation: `news-pulse 1.1s ease-in-out ${i * 0.18}s infinite`,
                  }}
                />
              ))}
            </div>
            <span className="text-[11px] text-zinc-600 font-mono">
              Memuat chart {TIMEFRAME_LABELS[timeframe]}...
            </span>
          </div>
        )}

        {/*
         * key={timeframe} memaksa React melakukan remount penuh pada <iframe>
         * setiap kali timeframe berubah, sehingga TradingView benar-benar
         * memuat ulang chart dengan interval yang baru — bukan hanya update src.
         */}
        <iframe
          key={timeframe}
          src={iframeSrc}
          title={`XAUUSD Chart — ${TIMEFRAME_LABELS[timeframe]}`}
          scrolling="no"
          allowTransparency={true}
          onLoad={() => setLoading(false)}
          className="w-full h-full border-0 block"
          style={{ userSelect: "none", boxSizing: "border-box" }}
        />
      </div>
    </div>
  )
}
