"use client"

import { useState, useEffect } from "react"
import { BarChart3 } from "lucide-react"

export function SplashScreen() {
  const [visible, setVisible] = useState(true)
  const [isFading, setIsFading] = useState(false)

  useEffect(() => {
    // Start smooth fade-out at 700ms
    const fadeTimer = setTimeout(() => {
      setIsFading(true)
    }, 700)

    // Unmount completely from DOM at 1000ms
    const hideTimer = setTimeout(() => {
      setVisible(false)
    }, 1000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(hideTimer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0D12] select-none transition-opacity duration-300 pointer-events-none ${
        isFading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Background ambient glow */}
      <div className="absolute w-72 h-72 rounded-full bg-amber-500/10 blur-3xl -translate-y-4" />

      {/* Brand Icon & Name */}
      <div className="relative flex flex-col items-center gap-3">
        {/* Glow Icon */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 shadow-2xl shadow-amber-500/20 backdrop-blur-md">
          <BarChart3 className="h-7 w-7 text-amber-400 animate-pulse" />
        </div>

        {/* Title */}
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-3xl font-black tracking-tight text-white">
            Zen<span className="text-amber-400">FX</span>
          </h1>
          <p className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-semibold">
            Personal Forex Trading Suite
          </p>
        </div>

        {/* Shimmer Line */}
        <div className="w-28 h-0.5 bg-zinc-800/80 rounded-full overflow-hidden mt-3">
          <div className="h-full bg-gradient-to-r from-transparent via-amber-400 to-transparent w-full animate-pulse" />
        </div>
      </div>
    </div>
  )
}
