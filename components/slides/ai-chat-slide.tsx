"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Loader2, Sparkles, ChevronRight } from "lucide-react"

interface Message {
  role: "user" | "assistant"
  content: string
}

const QUICK_PROMPTS = [
  "Apa berita ekonomi penting hari ini?",
  "Bagaimana pengaruh NFP terhadap XAUUSD?",
  "Analisis teknikal dan fundamental Gold saat ini?",
  "Bagaimana sentimen pasar terhadap Dolar AS?",
  "Jelaskan dampak geopolitik pada harga emas",
  "Kapan waktu rilis data inflasi (CPI) AS?",
]

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${
          isUser
            ? "bg-zinc-700/60 border border-zinc-600/50"
            : "bg-amber-500/15 border border-amber-500/30"
        }`}
      >
        {isUser ? (
          <User className="h-3.5 w-3.5 text-zinc-400" />
        ) : (
          <Bot className="h-3.5 w-3.5 text-amber-400" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 rounded-tr-sm"
            : "bg-[#161B22]/80 border border-amber-500/15 text-zinc-200 rounded-tl-sm"
        }`}
      >
        {/* Markdown-lite: bold, newlines */}
        {message.content.split("\n").map((line, i) => {
          const parts = line.split(/\*\*(.*?)\*\*/g)
          return (
            <p key={i} className={i > 0 ? "mt-2" : ""}>
              {parts.map((part, j) =>
                j % 2 === 1 ? (
                  <strong key={j} className="text-amber-400 font-semibold">
                    {part}
                  </strong>
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </p>
          )
        })}
      </div>
    </div>
  )
}

export function AiChatSlide() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Halo Zen! 👋 Saya ZenFX AI — analis pasar pribadi kamu yang berfokus pada **Market Research & Analisis Fundamental**.\n\nTanyakan apa saja: analisis XAUUSD, berita ekonomi makro, atau sentimen pasar terkini. Saya siap membantu!",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messageContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTo({
        top: messageContainerRef.current.scrollHeight,
        behavior: "smooth"
      })
    }
  }, [messages, loading])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = { role: "user", content: text.trim() }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      })
      const data = await res.json()
      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ Error: ${data.error ?? "Unknown error"}` },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "⚠️ Tidak dapat terhubung ke server. Pastikan GEMINI_API_KEY sudah dikonfigurasi di .env.local",
        },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter sends; Shift+Enter adds newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="flex h-full w-full bg-[#0A0D12] text-zinc-100 overflow-hidden">

      {/* Left sidebar: Quick prompts */}
      <div className="w-64 shrink-0 border-r border-zinc-800/60 flex flex-col bg-[#0D1117]">
        <div className="p-4 border-b border-zinc-800/60">
          <div className="flex items-center gap-2 mb-0.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400/80 tracking-widest uppercase">Quick Ask</span>
          </div>
          <p className="text-[11px] text-zinc-600 mt-1">Klik untuk bertanya langsung</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt}
              onClick={() => sendMessage(prompt)}
              disabled={loading}
              className="w-full text-left px-3 py-2.5 rounded-lg text-[12px] text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 border border-transparent hover:border-zinc-700/50 transition-all duration-150 leading-relaxed group"
            >
              <span className="flex items-start gap-2">
                <ChevronRight className="h-3 w-3 mt-0.5 text-amber-500/40 group-hover:text-amber-500/70 shrink-0 transition-colors" />
                {prompt}
              </span>
            </button>
          ))}
        </div>

        {/* Slide label */}
        <div className="p-4 border-t border-zinc-800/60">
          <span className="text-[10px] text-zinc-700 tracking-widest uppercase font-mono">Slide 3 · AI Market Analyst</span>
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 h-14 border-b border-zinc-800/60 shrink-0 bg-[#0D1117]">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <Bot className="h-4 w-4 text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">ZenFX AI</p>
            <p className="text-[11px] text-zinc-500">Market Research Analyst · Groq Powered</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-emerald-400/80">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={messageContainerRef} className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <MessageBubble key={i} message={msg} />
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center bg-amber-500/15 border border-amber-500/30">
                <Bot className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="bg-[#161B22]/80 border border-amber-500/15 rounded-xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 text-amber-400 animate-spin" />
                <span className="text-xs text-zinc-500">Menganalisis...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-zinc-800/60 bg-[#0D1117] shrink-0">
          <div className="flex items-end gap-3 bg-zinc-800/40 border border-zinc-700/50 rounded-xl px-4 py-3 focus-within:border-amber-500/40 transition-colors">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanya tentang market, berita ekonomi, atau analisis Gold..."
              rows={1}
              className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-600 resize-none outline-none leading-relaxed"
              style={{ maxHeight: "120px" }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:bg-amber-500/25 hover:border-amber-500/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-700 mt-2 text-center">
            Enter untuk kirim · Shift+Enter untuk baris baru
          </p>
        </div>
      </div>
    </div>
  )
}
