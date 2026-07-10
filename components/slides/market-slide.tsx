"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { TradingChart } from "@/components/trading-chart"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { PanelRight, BarChart3 } from "lucide-react"
import { isForexMarketOpen, getActiveSessions } from "@/lib/marketHours"

export function MarketSlide({ isActive = true }: { isActive?: boolean }) {
  const [marketOpen, setMarketOpen] = useState(false)
  const [sessions, setSessions] = useState<string[]>([])

  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setMarketOpen(isForexMarketOpen(d))
      setSessions(getActiveSessions(d))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    /*
     * Override SidebarProvider's `min-h-svh` by forcing height:100%
     * so it fills the slide viewport (absolute inset-0) rather than
     * trying to expand to full viewport height.
     */
    <SidebarProvider
      defaultOpen={true}
      style={{ "--sidebar-width": "18rem" } as React.CSSProperties}
      className="!min-h-0 h-full w-full flex flex-col"
    >
      {/* ── Slide header ── */}
      <div
        className="flex items-center justify-between px-4 h-11 shrink-0 border-b border-zinc-800/60 bg-[#0D1117] z-10"
        style={{ minHeight: "44px" }}
      >
        {/* Left: label + symbol */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-400/70 font-semibold tracking-widest uppercase">
              Slide 2
            </span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">XAU / USD</span>
            <span className="text-[11px] text-zinc-500 font-mono">Gold · OANDA</span>
          </div>
          {/* Market status badge */}
          <div
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
              marketOpen
                ? "bg-emerald-950/60 border-emerald-700/40 text-emerald-400"
                : "bg-red-950/60 border-red-700/40 text-red-400"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                marketOpen ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
            />
            {marketOpen ? "Open" : "Closed"}
          </div>
          {/* Active sessions */}
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
        </div>

        {/* Right: sidebar toggle */}
        <SidebarTrigger className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 px-2.5 py-1.5 rounded-lg transition-all border border-transparent hover:border-zinc-700/50">
          <PanelRight className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-xs">Fundamental Panel</span>
        </SidebarTrigger>
      </div>

      {/* ── Main content row: chart + sidebar ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Chart area */}
        <main className="flex-1 min-w-0 overflow-hidden p-2.5">
          <div className={`h-full w-full rounded-xl border border-zinc-800/50 overflow-hidden shadow-2xl shadow-black/60 transition-all duration-200 ${
            isActive ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}>
            <TradingChart />
          </div>
        </main>

        {/* Fundamental sidebar — renders inline at the end of flex row */}
        <AppSidebar />
      </div>
    </SidebarProvider>
  )
}
