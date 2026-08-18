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

export function formatEventContext(e: any): string {
  const forecastVal = (e.forecast !== null && e.forecast !== undefined && e.forecast !== "") ? e.forecast : "N/A"
  const previousVal = (e.previous !== null && e.previous !== undefined && e.previous !== "") ? e.previous : "N/A"
  const actualVal   = (e.actual !== null && e.actual !== undefined && e.actual !== "") ? e.actual : "Belum"
  return `• [${e.country || "GLOBAL"}] ${e.title} | Forecast: ${forecastVal} | Previous: ${previousVal} | Actual: ${actualVal}`
}

/* AI Digest Panel: generate analysis from live news + calendar */
function AiDigestPanel() {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string; time?: string }[]>([])
  const [input, setInput] = useState("")
  const [isSending, setIsSending] = useState(false)

  // Ambil data live untuk dijadikan konteks ke AI
  const { data: newsData } = useSWR("/api/news", fetcher, { revalidateOnFocus: false })
  const { data: calendarData } = useSWR("/api/economic-calendar", fetcher, { revalidateOnFocus: false })

  // Muat cached messages dari sessionStorage saat mount
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem("zenfx-chat-history")
      if (cached) {
        setMessages(JSON.parse(cached))
      }
    } catch {}
  }, [])

  const saveMessages = (msgs: { role: "user" | "assistant"; content: string; time?: string }[]) => {
    setMessages(msgs)
    try {
      sessionStorage.setItem("zenfx-chat-history", JSON.stringify(msgs))
    } catch {}
  }

  const getLiveContext = () => {
    const news: any[] = newsData?.news?.slice(0, 8) || []
    const events: any[] = (calendarData?.events || []).filter((e: any) => e.impact === "High").slice(0, 8)
    return `[SYSTEM CONTEXT - LIVE MARKET DATA]
HIGH IMPACT EVENTS:
${events.length > 0 ? events.map((e: any) => formatEventContext(e)).join("\n") : "Tidak ada event high impact."}

BERITA TERKINI:
${news.length > 0 ? news.map((n: any) => `• ${n.headline}`).join("\n") : "Tidak ada berita terkini."}`
  }

  const generateDigest = async () => {
    setIsSending(true)
    const contextPrompt = `${getLiveContext()}

Kamu adalah analis senior XAUUSD/Gold. Buat market brief singkat namun tajam berdasarkan data riil di atas. Format dengan bold:**Sentimen Gold:**, **Key Driver:**, **Watch List:**, **Outlook XAUUSD:**, **Risk Utama:**.`

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: contextPrompt }],
        }),
      })
      const data = await res.json()
      const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      const replyContent = data.reply ?? `⚠️ Gagal membuat digest: ${data.error ?? "Terjadi kesalahan tidak diketahui."}`
      saveMessages([
        ...messages,
        { role: "assistant" as const, content: replyContent, time: timeStr }
      ])
    } catch (err) {
      console.error(err)
      const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      saveMessages([
        ...messages,
        { role: "assistant" as const, content: "⚠️ Gagal terhubung ke server AI. Coba lagi sebentar.", time: timeStr }
      ])
    } finally {
      setIsSending(false)
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const query = input.trim()
    if (!query || isSending) return

    const timeStr = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    const updatedWithUser = [...messages, { role: "user" as const, content: query, time: timeStr }]
    setMessages(updatedWithUser)
    setInput("")
    setIsSending(true)

    // Send latest live context once alongside clean user conversation history
    const apiMessages = [
      { role: "user", content: `${getLiveContext()}\n\n[PERTANYAAN USER]: ${query}` }
    ]

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await res.json()
      const replyTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      const replyContent = data.reply ?? `⚠️ Gagal mendapat balasan: ${data.error ?? "Terjadi kesalahan tidak diketahui."}`
      saveMessages([
        ...updatedWithUser,
        { role: "assistant" as const, content: replyContent, time: replyTime }
      ])
    } catch (err) {
      console.error(err)
      const replyTime = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      saveMessages([
        ...updatedWithUser,
        { role: "assistant" as const, content: "⚠️ Gagal terhubung ke server AI. Coba lagi sebentar.", time: replyTime }
      ])
    } finally {
      setIsSending(false)
    }
  }

  const clearChat = () => {
    setMessages([])
    try {
      sessionStorage.removeItem("zenfx-chat-history")
    } catch {}
  }

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      if (!line.trim()) return null
      const parts = line.split(/\*\*(.*?)\*\*/g)
      return (
        <p key={i} className={`leading-relaxed ${i > 0 ? "mt-1.5" : ""}`}>
          {parts.map((part, j) =>
            j % 2 === 1 ? (
              <strong key={j} className="text-amber-400 font-semibold">
                {part}
              </strong>
            ) : (
              <span key={j} className="text-zinc-300 text-[12px]">
                {part}
              </span>
            )
          )}
        </p>
      )
    })
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#0D1117]">
      {/* Top Header / Action Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800/60 shrink-0 bg-zinc-900/40">
        <div className="flex items-center gap-2">
          <Bot className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-[11px] font-semibold text-zinc-300">AI Assistant &amp; Digest</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={generateDigest}
            disabled={isSending}
            title="Generate Quick Market Digest"
            className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            <Sparkles className="h-2.5 w-2.5" />
            <span>Quick Digest</span>
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              title="Reset Chat"
              className="text-zinc-600 hover:text-zinc-400 transition-colors p-1"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <ScrollArea className="flex-1 min-h-0 p-3">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-200 mb-1">Tanyakan Apapun tentang Market</p>
              <p className="text-[11px] text-zinc-500 max-w-[220px] leading-relaxed">
                Analisis berita, dampak data ekonomi, atau klik &ldquo;Quick Digest&rdquo; untuk analisis otomatis.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col gap-1 ${
                  m.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-xl text-[12px] leading-relaxed ${
                    m.role === "user"
                      ? "bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-br-none"
                      : "bg-zinc-900/80 border border-zinc-800/80 text-zinc-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  {m.role === "assistant" ? renderContent(m.content) : m.content}
                </div>
                {m.time && (
                  <span className="text-[9px] text-zinc-600 font-mono px-1">{m.time}</span>
                )}
              </div>
            ))}

            {isSending && (
              <div className="flex items-center gap-2 text-zinc-500 text-xs py-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
                <span className="text-[11px] italic">AI sedang berpikir...</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-2 border-t border-zinc-800/60 shrink-0 bg-zinc-900/30 flex items-center gap-2">
        <input
          type="text"
          placeholder="Tanyakan analisis XAUUSD/Forex..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="flex-1 bg-zinc-900/80 border border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/40 transition-all disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/35 text-amber-400 text-xs font-semibold hover:bg-amber-500/25 transition-all disabled:opacity-40"
        >
          Kirim
        </button>
      </form>
    </div>
  )
}

const MOBILE_PANELS = [
  { key: "calendar", label: "Calendar", icon: Globe },
  { key: "news", label: "News", icon: Newspaper },
  { key: "ai", label: "AI", icon: Sparkles },
] as const

/* News Research Slide */
export function NewsResearchSlide() {
  const [mobileTab, setMobileTab] = useState<"calendar" | "news" | "ai">("calendar")

  const calendarPanel = (
    <div className="flex flex-col h-full min-h-0">
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
  )

  const newsPanel = (
    <div className="flex flex-col h-full min-h-0">
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
  )

  const aiPanel = (
    <div className="flex flex-col h-full min-h-0">
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
  )

  const mobileActivePanel =
    mobileTab === "calendar" ? calendarPanel : mobileTab === "news" ? newsPanel : aiPanel

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0D12]">

      {/* Slide Header */}
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

      {/* Desktop 3-Panel Body (lg+) */}
      <div className="hidden lg:flex flex-1 min-h-0 overflow-hidden divide-x divide-zinc-800/60">
        <div className="w-[340px] shrink-0 flex flex-col min-h-0">{calendarPanel}</div>
        <div className="flex-1 flex flex-col min-h-0 min-w-0">{newsPanel}</div>
        <div className="w-[360px] shrink-0 flex flex-col min-h-0">{aiPanel}</div>
      </div>

      {/* Mobile Body (below lg): one panel at a time, switched via bottom segmented control */}
      <div className="lg:hidden flex flex-col flex-1 min-h-0">
        <div className="flex-1 min-h-0 overflow-hidden">{mobileActivePanel}</div>

        <div className="flex items-center gap-1 p-1.5 shrink-0 border-t border-zinc-800/60 bg-[#0D1117]">
          {MOBILE_PANELS.map((p) => {
            const isActive = p.key === mobileTab
            return (
              <button
                key={p.key}
                onClick={() => setMobileTab(p.key)}
                className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                    : "text-zinc-500 border border-transparent hover:bg-zinc-900/60"
                }`}
              >
                <p.icon className="h-4 w-4" />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
