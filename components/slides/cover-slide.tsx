"use client"

import { useEffect, useState } from "react"
import { BarChart3 } from "lucide-react"

interface CoverSlideProps {
  onEnter: () => void
}

export function CoverSlide({ onEnter }: CoverSlideProps) {
  const [visible, setVisible] = useState(false)
  const [showSub, setShowSub] = useState(false)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 200)
    const t2 = setTimeout(() => setShowSub(true), 900)
    const t3 = setTimeout(() => setShowCta(true), 1600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-hidden bg-[#0A0D12] select-none">

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-600/4 blur-[100px] animate-pulse" style={{ animationDuration: "4s" }} />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-yellow-500/3 blur-[90px] animate-pulse" style={{ animationDuration: "6s" }} />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(240,185,11,0.8) 1px, transparent 1px),
            linear-gradient(90deg, rgba(240,185,11,0.8) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Corner accent lines */}
      <div className="absolute top-8 left-8 w-12 h-12 border-l-2 border-t-2 border-amber-500/30" />
      <div className="absolute top-8 right-8 w-12 h-12 border-r-2 border-t-2 border-amber-500/30" />
      <div className="absolute bottom-8 left-8 w-12 h-12 border-l-2 border-b-2 border-amber-500/30" />
      <div className="absolute bottom-8 right-8 w-12 h-12 border-r-2 border-b-2 border-amber-500/30" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-8 text-center">

        {/* Logo icon */}
        <div
          className="flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 shadow-lg shadow-amber-500/10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.8)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <BarChart3 className="h-8 w-8 text-amber-400" />
        </div>

        {/* Welcome text */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.7s ease 0.1s, transform 0.7s ease 0.1s",
          }}
        >
          <p className="text-amber-400/70 text-sm font-medium tracking-[0.3em] uppercase mb-3">
            Private Trading Suite
          </p>
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
            Welcome,{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #F0B90B 0%, #FFD700 40%, #F0B90B 70%, #B8860B 100%)",
              }}
            >
              Zen The Trader
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-zinc-400 text-base md:text-lg max-w-md leading-relaxed"
          style={{
            opacity: showSub ? 1 : 0,
            transform: showSub ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          Market research, analisis fundamental, dan live economic news — semua dalam satu ruang pribadi.
        </p>

        {/* Divider */}
        <div
          className="w-16 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"
          style={{
            opacity: showSub ? 1 : 0,
            transition: "opacity 0.6s ease 0.2s",
          }}
        />

        {/* CTA */}
        <div
          style={{
            opacity: showCta ? 1 : 0,
            transform: showCta ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <button
            onClick={onEnter}
            className="group relative px-8 py-3.5 rounded-xl font-semibold text-sm tracking-wide overflow-hidden transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, rgba(240,185,11,0.15) 0%, rgba(240,185,11,0.08) 100%)",
              border: "1px solid rgba(240,185,11,0.35)",
              color: "#F0B90B",
              boxShadow: "0 0 20px rgba(240,185,11,0.1)",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Masuk ke Dashboard
              <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
            </span>
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ background: "linear-gradient(135deg, rgba(240,185,11,0.12) 0%, rgba(240,185,11,0.06) 100%)" }}
            />
          </button>

          <p className="mt-3 text-zinc-600 text-xs tracking-widest">
            atau tekan tombol <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-zinc-700 text-zinc-500 font-mono">→</kbd> di keyboard
          </p>
        </div>
      </div>

      {/* Version tag */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-zinc-700 text-[10px] tracking-widest uppercase font-mono">ZenFX v2.1 · News Research Edition</span>
      </div>
    </div>
  )
}
