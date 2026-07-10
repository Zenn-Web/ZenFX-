"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import {
  Newspaper,
  Globe,
  Sparkles,
  Bot,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react"
import { CryptoNews } from "@/components/crypto-news"
import { ForexNewsFeed } from "@/components/forex-news-feed"
import { ScrollArea } from "@/components/ui/scroll-area"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

/* ─────────────────────────────────────────────────────────────
   AI DIGEST PANEL — Panel kanan: generate analisis dari AI
   berdasarkan data live news + economic calendar
───────────────────────────────────────────────────────────── */
function AiDigestPanel() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle")
  const [digest, setDigest] = useState<string>("")
  const [digestTime, setDigestTime] = useState<string | null>(null)

  // Ambil data live untuk dijadikan konteks ke AI
  const { data: newsData } = useSWR("/api/news", fetcher, {
    revalidateOnFocus: false,
  })
  const { data: calendarData } = useSWR("/api/economic-calendar", fetcher, {
    revalidateOnFocus: false,
  })

  // Muat cached digest dari sessionStorage saat mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("zenfx-digest")
      const cachedTime = sessionStorage.getItem("zenfx-digest-time")
      if (cached) {
        setDigest(cached)
        setStatus("done")
        setDigestTime(cachedTime)
      }
    } catch {
      // sessionStorage mungkin tidak tersedia
    }
  }, [])

  const generateDigest = async () => {
    setStatus("loading")

    // Kumpulkan berita terkini (max 8 headline)
    const news: any[] = newsData?.news?.slice(0, 8) || []
    // Kumpulkan High Impact events saja (max 8 event)
    const events: any[] = (calendarData?.events || [])
      .filter((e: any) => e.impact === "High")
      .slice(0, 8)

    const prompt = `Kamu adalah analis senior XAUUSD/Gold. Buat market brief singkat namun tajam berdasarkan data riil berikut.

HIGH IMPACT ECONOMIC EVENTS (minggu ini & depan):
${
  events.length > 0
    ? events
        .map(
          (e: any) =>
            `• [${e.country}] ${e.title} | Forecast: ${e.forecast || "N/A"} | Previous: ${e.previous || "N/A"} | Actual: ${e.actual || "Belum dirilis"}`
        )
        .join("\n")
    : "Tidak ada data high impact event."
}

BERITA PASAR TERKINI:
${
  news.length > 0
    ? news.map((n: any) => `• ${n.headline}`).join("\n")
    : "Tidak ada berita terkini."
}

Tulis analisis dalam format PERSIS berikut (gunakan **bold** untuk label, jangan ganti format):

**Sentimen Gold:** [Bullish / Bearish / Mixed — 1 kalimat ringkas maksimum]

**Key Driver:** [Faktor utama yang saat ini mendominasi pergerakan Gold — 2 kalimat]

**Watch List:** [3 event/data paling kritis yang wajib dipantau trader Gold minggu ini]

**Outlook XAUUSD:** [Proyeksi arah harga Gold jangka pendek — 1-2 kalimat, gunakan level bila memungkinkan]

**Risk Utama:** [Skenario yang dapat membalik sentimen secara tajam — 1 kalimat]`

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
        }),
      })
      const data = await res.json()

      if (data.reply) {
        const now = new Date().toISOString()
        setDigest(data.reply)
        setStatus("done")
        setDigestTime(now)
        try {
          sessionStorage.setItem("zenfx-digest", data.reply)
          sessionStorage.setItem("zenfx-digest-time", now)
        } catch {}
      } else {
        setStatus("idle")
      }
    } catch {
      setStatus("idle")
    }
  }

  const clearDigest = () => {
    setStatus("idle")
    setDigest("")
    setDigestTime(null)
    try {
      sessionStorage.removeItem("zenfx-digest")
      sessionStorage.removeItem("zenfx-digest-time")
    } catch {}
  }

  const formatDigestTime = (iso: string | null) => {
    if (!iso) return ""
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
    })
  }

  // Render teks dengan markdown-lite (bold + newline)
  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return null
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className={`leading-relaxed ${i > 0 ? "mt-3" : ""}`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-amber-400 font-semibold">
                {part}
              </strong>
            ) : (
              <span key={j} className="text-zinc-300 text-[12.5px]">
                {part}
              </span>
            )
          )}
        </p>
      )
    })
  }

  /* ── IDLE state ── */
  if (status === "idle") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-6 gap-5 text-center h-full">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center shadow-lg shadow-amber-500/10">
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>

        <div>
          <p className="text-sm font-semibold text-zinc-100 mb-2">
            AI Market Digest
          </p>
          <p className="text-[12px] text-zinc-500 max-w-[240px] leading-relaxed">
            Generate ringkasan instan dari berita ekonomi &amp; events terkini
            — dianalisis oleh AI secara real-time.
          </p>
        </div>

        <button
          onClick={generateDigest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-400 text-sm font-semibold hover:bg-amber-500/25 hover:border-amber-500/55 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-500/10"
        >
          <Bot className="h-4 w-4" />
          Analisis Sekarang
        </button>

        <p className="text-[10px] text-zinc-700">
          Menggunakan data live dari Economic Calendar &amp; News Feed
        </p>
      </div>
    )
  }

  /* ── LOADING state ── */
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-6 gap-5 h-full">
        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center">
          <Loader2 className="h-5 w-5 text-amber-400 animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-zinc-200 mb-1.5">
            Menganalisis market...
          </p>
          <p className="text-[11px] text-zinc-600">
            Memproses {(calendarData?.events || []).filter((e: any) => e.impact === "High").length} events &amp;{" "}
            {(newsData?.news || []).length} berita terkini
          </p>
        </div>
        {/* Animated dots */}
        <div className="flex gap-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-amber-500/60"
              style={{
                animation: `news-pulse 1.2s ease-in-out ${i * 0.22}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  /* ── DONE state ── */
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Digest meta-bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800/60 shrink-0 bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-zinc-500">
            {digestTime
              ? `Dibuat ${formatDigestTime(digestTime)} WIB`
              : "Hasil analisis"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateDigest}
            title="Generate ulang"
            className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-amber-400 transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button
            onClick={clearDigest}
            title="Reset"
            className="flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-300 transition-colors"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Digest content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 digest-reveal space-y-0.5">{renderContent(digest)}</div>
      </ScrollArea>

      {/* Re-generate CTA */}
      <div className="p-3 border-t border-zinc-800/60 shrink-0">
        <button
          onClick={generateDigest}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-zinc-800/50 border border-zinc-700/40 text-zinc-500 text-xs font-medium hover:text-zinc-200 hover:bg-zinc-800/80 hover:border-zinc-600/50 transition-all"
        >
          <RefreshCw className="h-3 w-3" />
          Generate Ulang Analisis
        </button>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   NEWS RESEARCH SLIDE — Layout 3 panel utama
───────────────────────────────────────────────────────────── */
export function NewsResearchSlide() {
  return (
    <div className="flex flex-col h-full w-full bg-[#0A0D12]">

      {/* ── Slide Header ── */}
      <div
        className="flex items-center justify-between px-4 h-11 shrink-0 border-b border-zinc-800/60 bg-[#0D1117] z-10"
        style={{ minHeight: "44px" }}
      >
        {/* Left: label + title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Newspaper className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[10px] text-amber-400/70 font-semibold tracking-widest uppercase">
              Slide 1
            </span>
          </div>
          <span className="text-zinc-700">·</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white tracking-tight">
              Economic News Research
            </span>
            <span className="text-[11px] text-zinc-500 font-mono hidden md:block">
              USD · EUR · GBP · JPY
            </span>
          </div>
        </div>

        {/* Right: live indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 news-live-dot" />
            <span className="hidden sm:inline">LIVE</span>
          </div>
        </div>
      </div>

      {/* ── 3-Panel Body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden divide-x divide-zinc-800/60">

        {/* ── Panel Kiri: Economic Calendar (340px) ── */}
        <div className="w-[340px] shrink-0 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/40 shrink-0 bg-zinc-900/40 news-panel-header">
            <Globe className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[11px] font-semibold text-zinc-400 tracking-widest uppercase">
              Economic Calendar
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <CryptoNews showCountdown={true} defaultFilter="all" />
          </div>
        </div>

        {/* ── Panel Tengah: Live Market News (flex-1) ── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/40 shrink-0 bg-zinc-900/40 news-panel-header">
            <Newspaper className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[11px] font-semibold text-zinc-400 tracking-widest uppercase">
              Live Market News
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <ForexNewsFeed compact={false} />
          </div>
        </div>

        {/* ── Panel Kanan: AI Market Digest (360px) ── */}
        <div className="w-[360px] shrink-0 flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-zinc-800/40 shrink-0 bg-zinc-900/40 news-panel-header">
            <Sparkles className="h-3.5 w-3.5 text-zinc-500" />
            <span className="text-[11px] font-semibold text-zinc-400 tracking-widest uppercase">
              AI Market Digest
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
            <AiDigestPanel />
          </div>
        </div>

      </div>
    </div>
  )
}
