"use client"

import { useState, useEffect } from "react"
import {
  Globe,
  Activity,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Compass,
} from "lucide-react"
import { getActiveSessions } from "@/lib/marketHours"

type Timeframe = "1H" | "4H" | "1D" | "1W"

interface Asset {
  symbol: string
  name: string
  tvSymbol: string
  bias: "Bullish" | "Bearish" | "Neutral"
  desc: string
}

const ASSETS: Asset[] = [
  { symbol: "XAUUSD", name: "Gold / US Dollar",     tvSymbol: "OANDA:XAUUSD", bias: "Bullish", desc: "Safe-haven asset & inflation hedge" },
  { symbol: "DXY",    name: "US Dollar Index",      tvSymbol: "CAPITALCOM:DXY", bias: "Bearish", desc: "USD strength vs currency basket" },
  { symbol: "US10Y",  name: "US 10Y Bond Yield",    tvSymbol: "TVC:US10Y",    bias: "Neutral", desc: "Benchmark for global interest rates" },
  { symbol: "EURUSD", name: "Euro / US Dollar",     tvSymbol: "FX:EURUSD",    bias: "Bullish", desc: "Top global forex currency pair" },
]

const KEY_INDICATORS = [
  { name: "Fed Funds Rate", actual: "4.50%", forecast: "4.50%", impact: "High" },
  { name: "US CPI (YoY)",   actual: "2.7%",  forecast: "2.6%",  impact: "High" },
  { name: "Core PCE",       actual: "2.8%",  forecast: "2.8%",  impact: "High" },
  { name: "Non-Farm Payroll", actual: "256K", forecast: "160K", impact: "High" },
]

export function MarketOverviewSlide() {
  const [sessions, setSessions] = useState<string[]>([])
  const [selectedAsset, setSelectedAsset] = useState<Asset>(ASSETS[0])
  const [timeframe, setTimeframe] = useState<Timeframe>("1D")
  const [chartLoading, setChartLoading] = useState(false)

  useEffect(() => {
    const update = () => setSessions(getActiveSessions(new Date()))
    update()
    const id = setInterval(update, 30_000)
    return () => clearInterval(id)
  }, [])

  const handleAssetSelect = (asset: Asset) => {
    if (asset.symbol !== selectedAsset.symbol) {
      setChartLoading(true)
      setSelectedAsset(asset)
    }
  }

  const handleTimeframeChange = (tf: Timeframe) => {
    if (tf !== timeframe) {
      setChartLoading(true)
      setTimeframe(tf)
    }
  }

  const intervalParam =
    timeframe === "1H" ? "60" : timeframe === "4H" ? "240" : timeframe === "1W" ? "W" : "D"

  const iframeSrc = `https://s.tradingview.com/widgetembed/?frameElementId=tradingview_market_overview&symbol=${encodeURIComponent(
    selectedAsset.tvSymbol
  )}&interval=${intervalParam}&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=0D1117&studies=%5B%5D&theme=dark&style=1&timezone=Asia%2FJakarta&studies_overrides=%7B%7D&overrides=%7B%22mainSeriesProperties.style%22%3A1%7D&enabled_features=%5B%5D&disabled_features=%5B%5D&locale=en`

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0D12] text-zinc-100 p-3 overflow-hidden select-none gap-2">
      {/* Top Header: Title & Quick Asset Pills */}
      <div className="flex items-center justify-between shrink-0 border-b border-zinc-800/60 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30">
            <BarChart3 className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tight leading-none">
              Market Overview &amp; Live Terminal
            </h1>
            <span className="text-[10px] text-zinc-500 font-mono">
              Live Macro Sentiment, Active Sessions, &amp; TradingView Technical Chart
            </span>
          </div>
        </div>

        {/* Quick Asset Selector Pills */}
        <div className="flex items-center gap-1.5 bg-zinc-900/90 border border-zinc-800 p-1 rounded-xl">
          {ASSETS.map((asset) => {
            const isSelected = selectedAsset.symbol === asset.symbol
            return (
              <button
                key={asset.symbol}
                onClick={() => handleAssetSelect(asset)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-transparent"
                }`}
              >
                <span>{asset.symbol}</span>
                <span
                  className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                    asset.bias === "Bullish"
                      ? "bg-emerald-500/15 text-emerald-400"
                      : asset.bias === "Bearish"
                      ? "bg-red-500/15 text-red-400"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  {asset.bias === "Bullish" ? "▲" : asset.bias === "Bearish" ? "▼" : "●"}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Main Bento Grid: Live Chart (8 cols) + Right Analytics Stack (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1 min-h-0">
        
        {/* Left Column: Interactive Live Chart Terminal (8/12 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-xl bg-zinc-900/50 border border-zinc-800/80 overflow-hidden shadow-xl min-h-0">
          {/* Chart Header Controls */}
          <div className="flex items-center justify-between bg-[#0D1117] px-3 py-1.5 border-b border-zinc-800/60 shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400 font-mono">
                {selectedAsset.symbol}
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

        {/* Right Column: 3 Perfectly-Filled Bento Intelligence Cards (4/12 cols) */}
        <div className="lg:col-span-4 flex flex-col min-h-0 gap-2 h-full justify-between">
          
          {/* Bento Card 1: Active Trading Sessions */}
          <div className="flex flex-col p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-1.5 shrink-0">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1">
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
          <div className="flex flex-col p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-1.5 shrink-0">
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1">
              <div className="flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5 text-amber-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Key Macro Snapshot</h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">US Data</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {KEY_INDICATORS.map((ind) => (
                <div key={ind.name} className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-medium text-zinc-300 truncate">{ind.name}</span>
                    <span className="text-[8px] font-mono text-zinc-400 bg-zinc-800/80 px-1 py-0.2 rounded border border-zinc-700/40">{ind.impact}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-xs font-bold font-mono text-amber-400">{ind.actual}</span>
                    <span className="text-[9px] font-mono text-zinc-500">Exp: {ind.forecast}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bento Card 3: Macro Sentiment & Market Bias Matrix (Fills entire bottom height) */}
          <div className="flex flex-col p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-2 flex-1 min-h-0 justify-between">
            {/* Card Header */}
            <div className="flex items-center justify-between border-b border-zinc-800/60 pb-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <Compass className="h-3.5 w-3.5 text-amber-400" />
                <h2 className="text-xs font-bold text-white uppercase tracking-wider">Macro Bias &amp; Sentiment</h2>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">Risk-On (68%)</span>
            </div>

            {/* Sentiment Meter Bar */}
            <div className="flex flex-col gap-1 bg-zinc-900/90 p-2 rounded-lg border border-zinc-800/70 shrink-0">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-medium">Market Sentiment Driver:</span>
                <span className="text-amber-400 font-mono font-bold">Dovish Fed Policy &amp; Safe-Haven</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex mt-0.5">
                <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 h-full w-[68%] rounded-full animate-pulse shadow-sm shadow-emerald-400/20" />
              </div>
            </div>

            {/* 3 Driver Cards (Fills space evenly) */}
            <div className="grid grid-cols-3 gap-1.5 text-[9px] font-mono flex-1">
              <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between items-center text-center">
                <span className="text-zinc-500 font-medium text-[8px]">DXY Index</span>
                <span className="text-red-400 font-bold text-[10px] flex items-center gap-0.5">
                  <TrendingDown className="h-3 w-3 inline" /> 102.40
                </span>
                <span className="text-[8px] text-zinc-500 truncate w-full">Bearish Stance</span>
              </div>

              <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between items-center text-center">
                <span className="text-zinc-500 font-medium text-[8px]">US10Y Yield</span>
                <span className="text-amber-400 font-bold text-[10px]">
                  ● 4.12%
                </span>
                <span className="text-[8px] text-zinc-500 truncate w-full">Consolidating</span>
              </div>

              <div className="p-2 rounded-lg bg-zinc-900/70 border border-zinc-800/80 flex flex-col justify-between items-center text-center">
                <span className="text-zinc-500 font-medium text-[8px]">XAUUSD Bias</span>
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                  <TrendingUp className="h-3 w-3 inline" /> $2,680
                </span>
                <span className="text-[8px] text-emerald-400/80 truncate w-full">Bullish Flow</span>
              </div>
            </div>

            {/* Pro Tip Footer */}
            <div className="p-1.5 rounded-lg bg-amber-500/5 border border-amber-500/15 flex items-center gap-1.5 shrink-0">
              <ShieldAlert className="h-3 w-3 text-amber-400 shrink-0" />
              <p className="text-[9px] text-zinc-400 leading-tight truncate">
                <strong className="text-amber-400">Zen Macro Tip:</strong> Pelemahan DXY &amp; stabilitas yield mendukung momentum beli XAUUSD.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
