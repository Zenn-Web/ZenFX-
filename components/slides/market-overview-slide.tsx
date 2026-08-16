"use client"

import React, { useState, useEffect } from "react"
import { Globe, TrendingUp, TrendingDown, Activity, ShieldAlert, ChartCandlestick } from "lucide-react"
import { isForexMarketOpen, getActiveSessions } from "@/lib/marketHours"

type Timeframe = "1H" | "4H" | "1D" | "1W"

const TIMEFRAME_MAP: Record<Timeframe, string> = {
  "1H": "60",
  "4H": "240",
  "1D": "D",
  "1W": "W",
}

const ASSETS = [
  { symbol: "XAUUSD", name: "Gold / USD", tvSymbol: "OANDA:XAUUSD", category: "Commodity", bias: "Bullish", change: "+0.84%" },
  { symbol: "DXY", name: "USD Index", tvSymbol: "CAPITALCOM:DXY", category: "Index", bias: "Bearish", change: "-0.32%" },
  { symbol: "US10Y", name: "US 10Y Yield", tvSymbol: "TVC:US10Y", category: "Bonds", bias: "Neutral", change: "+0.05%" },
  { symbol: "EURUSD", name: "EUR / USD", tvSymbol: "OANDA:EURUSD", category: "Forex", bias: "Bullish", change: "+0.28%" },
]

const KEY_INDICATORS = [
  { name: "US CPI (YoY)", actual: "2.4%", forecast: "2.3%", impact: "Bullish USD" },
  { name: "Core PCE", actual: "2.5%", forecast: "2.4%", impact: "Fed Benchmark" },
  { name: "Non-Farm Payrolls", actual: "255k", forecast: "240k", impact: "High Volatility" },
  { name: "Fed Funds Rate", actual: "5.25%", forecast: "5.25%", impact: "Hawkish Hold" },
]

export function MarketOverviewSlide() {
  const [now, setNow] = useState(new Date())
  const [marketOpen, setMarketOpen] = useState(true)
  const [sessions, setSessions] = useState<string[]>([])
  const [selectedAsset, setSelectedAsset] = useState(ASSETS[0])
  const [timeframe, setTimeframe] = useState<Timeframe>("1D")
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    const tick = () => {
      const current = new Date()
      setNow(current)
      setMarketOpen(isForexMarketOpen(current))
      setSessions(getActiveSessions(current))
    }
    tick()
    const interval = setInterval(tick, 30_000)
    return () => clearInterval(interval)
  }, [])

  const utcTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  })

  const config = {
    autosize: true,
    symbol: selectedAsset.tvSymbol,
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
    setChartLoading(true)
    setTimeframe(tf)
  }

  const handleAssetSelect = (asset: typeof ASSETS[0]) => {
    if (asset.symbol === selectedAsset.symbol) return
    setChartLoading(true)
    setSelectedAsset(asset)
  }

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0D12] text-zinc-100 overflow-hidden p-3 md:p-4 gap-2.5 select-none">
      {/* Top Header & Compact Asset Quick Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 shrink-0 pb-1 border-b border-zinc-800/60">
        {/* Title / Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <Activity className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base md:text-lg font-extrabold text-white tracking-tight leading-none">
                Market Overview
              </h1>
              <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 leading-none">
                Macro Terminal
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 leading-none">Global Forex &amp; Gold Analysis</span>
          </div>
        </div>

        {/* 4 Interactive Asset Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {ASSETS.map((asset) => {
            const isSelected = selectedAsset.symbol === asset.symbol
            const isPositive = asset.change.startsWith("+")
            return (
              <button
                key={asset.symbol}
                onClick={() => handleAssetSelect(asset)}
                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-400 shadow-sm shadow-amber-500/10"
                    : "bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                }`}
              >
                <span className="font-bold">{asset.symbol}</span>
                <span
                  className={`text-[10px] font-semibold flex items-center ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {asset.change}
                </span>
              </button>
            )
          })}
        </div>

        {/* Live Status & Clock */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-semibold">
            <span className={`w-2 h-2 rounded-full ${marketOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span className={marketOpen ? "text-emerald-400" : "text-red-400"}>
              {marketOpen ? "Market Active" : "Closed"}
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800 text-[11px] font-mono text-amber-400 font-semibold">
            UTC {utcTime}
          </div>
        </div>
      </div>

      {/* Main Bento Grid Viewport (Strict 0-Scroll Fill) */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* Left Column: Live Chart Terminal (8/12 cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-0 rounded-xl bg-zinc-900/60 border border-zinc-800/70 overflow-hidden shadow-sm">
          {/* Chart Header Bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-zinc-950/80 border-b border-zinc-800/60 shrink-0 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/10 border border-amber-500/25">
                <ChartCandlestick className="h-3 w-3 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-white tracking-tight">
                {selectedAsset.symbol === "XAUUSD" ? "XAU / USD" : selectedAsset.symbol}
              </span>
              <span className="text-[11px] text-zinc-500 font-mono hidden sm:inline">
                · {selectedAsset.name}
              </span>
              <span
                className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                  selectedAsset.bias === "Bullish"
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-700/40"
                    : selectedAsset.bias === "Bearish"
                    ? "bg-red-950/60 text-red-400 border-red-700/40"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {selectedAsset.bias}
              </span>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-0.5 rounded-lg">
              {(["1H", "4H", "1D", "1W"] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => handleTimeframeChange(tf)}
                  className={`px-2 py-0.5 text-[11px] font-semibold rounded transition-all cursor-pointer ${
                    timeframe === tf
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Chart Frame Area (Flex-1 stretches without scrolling) */}
          <div className="relative flex-1 min-h-0 w-full bg-[#0D1117]">
            {chartLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0D1117]/90 backdrop-blur-xs z-10 gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-amber-500/30 border-t-amber-400 animate-spin" />
                <span className="text-[11px] text-zinc-400 font-mono">Memuat Live Chart...</span>
              </div>
            )}
            <iframe
              key={`${selectedAsset.symbol}-${timeframe}`}
              src={iframeSrc}
              className="w-full h-full border-0 absolute inset-0"
              onLoad={() => setChartLoading(false)}
              allowFullScreen
              title={`TradingView Chart ${selectedAsset.symbol}`}
            />
          </div>
        </div>

        {/* Right Column: Sessions & Macro Intelligence (4/12 cols) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 gap-2.5 justify-between">
          {/* Bento Card 1: Active Trading Sessions */}
          <div className="flex flex-col p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-2 shrink-0">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-amber-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Trading Sessions</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">Live Clock</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: "Sydney", hours: "22:00 - 07:00", active: sessions.includes("Sydney") },
                { name: "Tokyo", hours: "00:00 - 09:00", active: sessions.includes("Tokyo") },
                { name: "London", hours: "08:00 - 17:00", active: sessions.includes("London") },
                { name: "New York", hours: "13:00 - 21:00", active: sessions.includes("New York") },
              ].map((s) => (
                <div
                  key={s.name}
                  className={`flex flex-col px-2.5 py-1.5 rounded-lg border transition-all ${
                    s.active
                      ? "bg-amber-500/10 border-amber-500/30 text-white shadow-xs"
                      : "bg-zinc-900/30 border-zinc-800/40 text-zinc-500"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{s.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${s.active ? "bg-amber-400 animate-pulse" : "bg-zinc-700"}`} />
                  </div>
                  <span className="text-[9px] font-mono text-zinc-500">{s.hours} UTC</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card 2: Key Macro Indicators Snapshot */}
          <div className="flex flex-col p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-2 flex-1 min-h-0 justify-between">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-amber-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Key Macro Snapshot</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">US Data</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 flex-1 min-h-0 content-center">
              {KEY_INDICATORS.map((ind) => (
                <div key={ind.name} className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60 flex flex-col gap-0.5 justify-between">
                  <span className="text-[10px] font-medium text-zinc-300 truncate">{ind.name}</span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold font-mono text-amber-400">{ind.actual}</span>
                    <span className="text-[9px] font-mono text-zinc-500">Exp: {ind.forecast}</span>
                  </div>
                  <div className="text-[8px] text-zinc-400 font-mono bg-zinc-800/60 px-1 py-0.5 rounded w-fit border border-zinc-700/40">
                    {ind.impact}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-start gap-1.5 shrink-0">
              <ShieldAlert className="h-3 w-3 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[9px] text-zinc-400 leading-tight">
                <strong className="text-amber-400">Tip:</strong> Sinkronkan analisis sentimen berita dengan konfirmasi teknikal pada chart.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
