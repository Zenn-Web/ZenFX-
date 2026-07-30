"use client"

import React, { useState, useEffect } from "react"
import { Globe, TrendingUp, TrendingDown, Clock, Activity, ShieldAlert, BarChart3 } from "lucide-react"
import { isForexMarketOpen, getActiveSessions } from "@/lib/marketHours"

const ASSETS = [
  { symbol: "XAUUSD", name: "Gold / US Dollar", tvSymbol: "OANDA:XAUUSD", category: "Commodity", bias: "Bullish", change: "+0.84%" },
  { symbol: "DXY", name: "US Dollar Index", tvSymbol: "CAPITALCOM:DXY", category: "Currency Index", bias: "Bearish", change: "-0.32%" },
  { symbol: "US10Y", name: "US 10-Yr Treasury Yield", tvSymbol: "TVC:US10Y", category: "Bonds", bias: "Neutral", change: "+0.05%" },
  { symbol: "EURUSD", name: "Euro / US Dollar", tvSymbol: "OANDA:EURUSD", category: "Forex Pair", bias: "Bullish", change: "+0.28%" },
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

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0D12] text-zinc-100 overflow-y-auto p-4 md:p-6 gap-5">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
              Executive Overview
            </span>
            <span className="text-xs text-zinc-500">· Global Forex &amp; Gold</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Market Macro Overview
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800">
            <span className={`w-2 h-2 rounded-full ${marketOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
            <span className="text-xs font-semibold text-zinc-200">
              {marketOpen ? "Market Active" : "Market Closed"}
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-amber-400 font-semibold">
            UTC {utcTime}
          </div>
        </div>
      </div>

      {/* Asset Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ASSETS.map((asset) => (
          <div
            key={asset.symbol}
            className="flex flex-col p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/70 hover:border-amber-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">{asset.category}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  asset.bias === "Bullish"
                    ? "bg-emerald-950/60 text-emerald-400 border-emerald-700/40"
                    : asset.bias === "Bearish"
                    ? "bg-red-950/60 text-red-400 border-red-700/40"
                    : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}
              >
                {asset.bias}
              </span>
            </div>
            <div className="text-xl font-bold text-white group-hover:text-amber-400 transition-colors">
              {asset.symbol}
            </div>
            <div className="text-xs text-zinc-400 mb-3">{asset.name}</div>
            <div className="mt-auto flex items-center justify-between border-t border-zinc-800/50 pt-2 text-xs">
              <span className="text-zinc-500 text-[11px]">24h Change</span>
              <span
                className={`font-mono font-bold flex items-center gap-1 ${
                  asset.change.startsWith("+") ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {asset.change.startsWith("+") ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {asset.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2-Column Section: Active Sessions & Key Economic Snapshot */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Trading Sessions Card */}
        <div className="lg:col-span-1 flex flex-col p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-4">
          <div className="flex items-center gap-2 border-b border-zinc-800/60 pb-3">
            <Globe className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Global Trading Sessions</h2>
          </div>

          <div className="space-y-3">
            {[
              { name: "Sydney", hours: "22:00 - 07:00 UTC", active: sessions.includes("Sydney") },
              { name: "Tokyo", hours: "00:00 - 09:00 UTC", active: sessions.includes("Tokyo") },
              { name: "London", hours: "08:00 - 17:00 UTC", active: sessions.includes("London") },
              { name: "New York", hours: "13:00 - 21:00 UTC", active: sessions.includes("New York") },
            ].map((s) => (
              <div
                key={s.name}
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  s.active
                    ? "bg-amber-500/10 border-amber-500/30 text-white shadow-sm"
                    : "bg-zinc-900/30 border-zinc-800/40 text-zinc-500"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${s.active ? "bg-amber-400 animate-pulse" : "bg-zinc-700"}`} />
                  <span className="text-xs font-bold">{s.name}</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">{s.hours}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Data Snapshot */}
        <div className="lg:col-span-2 flex flex-col p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/70 gap-4">
          <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Key Macro Indicators</h2>
            </div>
            <span className="text-[11px] font-mono text-zinc-500">US Macro Data</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {KEY_INDICATORS.map((ind) => (
              <div key={ind.name} className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800/60 flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-zinc-300">{ind.name}</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-amber-400">{ind.actual}</span>
                  <span className="text-[11px] font-mono text-zinc-500">Exp: {ind.forecast}</span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono bg-zinc-800/60 px-2 py-0.5 rounded w-fit border border-zinc-700/50">
                  {ind.impact}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              <strong className="text-amber-400">Risk Warning:</strong> Selalu koordinasikan analisis fundamental makro dengan aksi harga teknikal di chart sebelum membuat keputusan transaksi.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
