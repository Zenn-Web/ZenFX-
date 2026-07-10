"use client"

import React from "react"
import useSWR from "swr"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, AlertCircle, ExternalLink, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"

interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  datetime: number
  category: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

function timeAgo(unixTimestamp: number): string {
  const now = Date.now()
  const diff = now - unixTimestamp * 1000

  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Baru saja"
  if (minutes < 60) return `${minutes}m lalu`
  if (hours < 24) return `${hours}j lalu`
  return `${days}h lalu`
}

// Badge sumber berita — menggunakan shadcn Badge dengan warna per source
function SourceBadge({ source }: { source: string }) {
  const colorMap: Record<string, string> = {
    Reuters: "bg-orange-950/60 text-orange-400 border-orange-700/40",
    Bloomberg: "bg-blue-950/60 text-blue-400 border-blue-700/40",
    CNBC: "bg-purple-950/60 text-purple-400 border-purple-700/40",
    Forexlive: "bg-emerald-950/60 text-emerald-400 border-emerald-700/40",
    "Forex Factory": "bg-amber-950/60 text-amber-400 border-amber-700/40",
    Investopedia: "bg-cyan-950/60 text-cyan-400 border-cyan-700/40",
    MarketWatch: "bg-lime-950/60 text-lime-400 border-lime-700/40",
  }

  const style =
    colorMap[source] || "bg-zinc-800/60 text-zinc-400 border-zinc-700/40"

  return (
    <Badge
      variant="outline"
      className={`text-[10px] font-semibold h-4 px-1.5 shrink-0 ${style}`}
    >
      {source}
    </Badge>
  )
}

// Analisis sentimen Gold berdasarkan keyword di headline
function getGoldSentiment(headline: string): "bullish" | "bearish" | null {
  const text = headline.toLowerCase()
  const bullishKw = ["rises", "climbs", "surges", "gains", "jumps", "rally", "higher", "safe-haven", "safe haven", "demand", "buying"]
  const bearishKw = ["falls", "drops", "slides", "declines", "plunges", "sinks", "lower", "sell-off", "selloff", "pressure", "retreat"]
  const hasBullish = bullishKw.some(k => text.includes(k))
  const hasBearish = bearishKw.some(k => text.includes(k))
  if (hasBullish && !hasBearish) return "bullish"
  if (hasBearish && !hasBullish) return "bearish"
  return null
}

// Gold Sentiment badge
function SentimentBadge({ headline }: { headline: string }) {
  const s = getGoldSentiment(headline)
  if (!s) return null
  return (
    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
      s === "bullish"
        ? "bg-emerald-950/50 text-emerald-400 border-emerald-700/40"
        : "bg-red-950/50 text-red-400 border-red-700/40"
    }`}>
      {s === "bullish"
        ? <TrendingUp className="h-2.5 w-2.5" />
        : <TrendingDown className="h-2.5 w-2.5" />}
      <span>{s === "bullish" ? "Gold ▲" : "Gold ▼"}</span>
    </div>
  )
}

/**
 * ForexNewsFeed
 * @param compact true  → sidebar mode (thin list, like before)
 *                false → full-panel mode (card layout, richer preview)
 */
export function ForexNewsFeed({ compact = true }: { compact?: boolean }) {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/news",
    fetcher,
    {
      refreshInterval: 5 * 60 * 1000, // 5 menit
      revalidateOnFocus: true,
    }
  )

  const news: NewsItem[] = data?.news || []
  const isDemoMode = data?.source === "demo"

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-zinc-500">
        <RefreshCw className="h-4 w-4 animate-spin" />
        <span className="text-xs">Memuat berita forex...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 px-4 text-center">
        <AlertCircle className="h-4 w-4 text-red-500" />
        <span className="text-xs text-red-400">Gagal memuat berita.</span>
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
        {isDemoMode ? (
          <span className="text-[10px] text-amber-400/80 font-medium">
            ⚠️ Demo — Set FINNHUB_API_KEY di .env.local
          </span>
        ) : (
          <span className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {news.length} berita · Update 5 menit
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

      {/* News List */}
      <ScrollArea className="flex-1 min-h-0">
        {news.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-xs text-zinc-500">
            Tidak ada berita saat ini.
          </div>
        ) : compact ? (
          /* ── COMPACT MODE (sidebar) ── */
          <div className="flex flex-col divide-y divide-zinc-800/40">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 hover:bg-zinc-800/30 transition-colors group"
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <SourceBadge source={item.source} />
                  <span className="text-[10px] text-zinc-600 font-mono ml-auto">
                    {timeAgo(item.datetime)}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                </div>
                <p className="text-xs font-medium text-zinc-200 leading-snug group-hover:text-white transition-colors line-clamp-3">
                  {item.headline}
                </p>
                {item.summary && (
                  <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed line-clamp-2">
                    {item.summary.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </a>
            ))}
          </div>
        ) : (
          /* ── FULL CARD MODE (News Research panel) ── */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 p-3">
            {news.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="news-card-hover group flex flex-col gap-2 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/60 hover:border-zinc-700/60 hover:bg-zinc-900/80"
              >
                {/* Card header */}
                <div className="flex items-center gap-2 flex-wrap">
                  <SourceBadge source={item.source} />
                  <SentimentBadge headline={item.headline} />
                  <span className="text-[10px] text-zinc-600 font-mono ml-auto shrink-0">
                    {timeAgo(item.datetime)}
                  </span>
                  <ExternalLink className="h-2.5 w-2.5 text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0" />
                </div>

                {/* Headline */}
                <p className="text-[13px] font-semibold text-zinc-200 leading-snug group-hover:text-white transition-colors line-clamp-2">
                  {item.headline}
                </p>

                {/* Summary */}
                {item.summary && (
                  <p className="text-[11px] text-zinc-500 leading-relaxed line-clamp-3">
                    {item.summary.replace(/<[^>]*>/g, "")}
                  </p>
                )}
              </a>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
