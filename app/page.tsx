"use client"

import { useState, useEffect, useCallback } from "react"
import { CoverSlide } from "@/components/slides/cover-slide"
import { MarketOverviewSlide } from "@/components/slides/market-overview-slide"
import { NewsResearchSlide } from "@/components/slides/news-research-slide"
import { NewsElementSlide } from "@/components/slides/news-element-slide"
import { BarChart3, LayoutDashboard, Newspaper, TrendingUp, LayoutGrid, LogOut, UserCheck } from "lucide-react"
import { SplashScreen } from "@/components/splash-screen"
import {
  isForexMarketOpen,
  getActiveSessions,
} from "@/lib/marketHours"
import { supabase } from "@/lib/supabaseClient"

/* Slide config */
const SLIDES = [
  { id: "cover",           label: "Cover",           icon: LayoutDashboard,   shortcut: "0" },
  { id: "market-overview", label: "Market Overview", icon: LayoutGrid,        shortcut: "1" },
  { id: "news-research",   label: "News Research",   icon: Newspaper,         shortcut: "2" },
  { id: "news-element",    label: "News Element",    icon: TrendingUp,        shortcut: "3" },
] as const

type SlideId = (typeof SLIDES)[number]["id"]

/* Slide transition directions */
type Direction = "left" | "right" | "none"

const SLIDE_INDEX: Record<SlideId, number> = {
  cover: 0,
  "market-overview": 1,
  "news-research": 2,
  "news-element": 3,
}

export default function Home() {
  const [current, setCurrent] = useState<SlideId>("cover")
  const [prev, setPrev] = useState<SlideId | null>(null)
  const [direction, setDirection] = useState<Direction>("none")
  const [animating, setAnimating] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const [sessions, setSessions] = useState<string[]>([])
  const [now, setNow] = useState(new Date())

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [shakeAlert, setShakeAlert] = useState(false)

  // Initialize Supabase Auth Session & Restore Tab only when inside dashboard
  useEffect(() => {
    const restoreDashboardTabIfActive = () => {
      try {
        const savedTab = localStorage.getItem("zenfx_active_dashboard_tab") as SlideId
        if (savedTab && ["market-overview", "news-research", "news-element"].includes(savedTab)) {
          setCurrent(savedTab)
        }
      } catch {}
    }

    // Check initial active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)
        restoreDashboardTabIfActive()
      } else {
        // Fallback to local session check
        const localAuth = localStorage.getItem("zenfx_authenticated")
        const localEmail = localStorage.getItem("zenfx_user_email")
        if (localAuth === "true") {
          setIsAuthenticated(true)
          setUserEmail(localEmail || "Zen Trader")
          restoreDashboardTabIfActive()
        }
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setIsAuthenticated(true)
        setUserEmail(session.user.email || null)
        localStorage.setItem("zenfx_authenticated", "true")
        localStorage.setItem("zenfx_user_email", session.user.email || "")
      } else {
        setIsAuthenticated(false)
        setUserEmail(null)
        localStorage.removeItem("zenfx_authenticated")
        localStorage.removeItem("zenfx_user_email")
        localStorage.removeItem("zenfx_active_dashboard_tab")
        setCurrent("cover")
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Market status ticker
  useEffect(() => {
    const tick = () => {
      const d = new Date()
      setNow(d)
      setMarketOpen(isForexMarketOpen(d))
      setSessions(getActiveSessions(d))
    }
    tick()
    const id = setInterval(tick, 30_000)
    return () => clearInterval(id)
  }, [])

  const handleLoginSuccess = (email: string) => {
    setIsAuthenticated(true)
    setUserEmail(email)
    localStorage.setItem("zenfx_authenticated", "true")
    localStorage.setItem("zenfx_user_email", email)
    setShakeAlert(false)
    const targetTab = (localStorage.getItem("zenfx_active_dashboard_tab") as SlideId) || "market-overview"
    goTo(targetTab)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAuthenticated(false)
    setUserEmail(null)
    localStorage.removeItem("zenfx_authenticated")
    localStorage.removeItem("zenfx_user_email")
    localStorage.removeItem("zenfx_active_dashboard_tab")
    setCurrent("cover")
  }

  const goTo = useCallback(
    (target: SlideId) => {
      if (target === current || animating) return

      // Guardrail: Protect slides 1-3 if unauthenticated
      if (target !== "cover" && !isAuthenticated) {
        setShakeAlert(true)
        setCurrent("cover")
        setTimeout(() => setShakeAlert(false), 1500)
        return
      }

      // Save tab only when navigating among dashboard pages (slides 1, 2, 3)
      if (target !== "cover") {
        localStorage.setItem("zenfx_active_dashboard_tab", target)
      } else {
        localStorage.removeItem("zenfx_active_dashboard_tab")
      }

      const dir = SLIDE_INDEX[target] > SLIDE_INDEX[current] ? "left" : "right"
      setDirection(dir)
      setPrev(current)
      setCurrent(target)
      setAnimating(true)

      setTimeout(() => {
        setPrev(null)
        setAnimating(false)
        setDirection("none")
      }, 420)
    },
    [current, animating, isAuthenticated]
  )

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't hijack when user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return

      const idx = SLIDE_INDEX[current]
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        const next = SLIDES[idx + 1]
        if (next) goTo(next.id)
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        const prev = SLIDES[idx - 1]
        if (prev) goTo(prev.id)
      } else if (e.key === "0") goTo("cover")
      else if (e.key === "1") goTo("market-overview")
      else if (e.key === "2") goTo("news-research")
      else if (e.key === "3") goTo("news-element")
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [current, goTo])

  const utcTime = now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  })

  const renderSlide = (id: SlideId) => {
    switch (id) {
      case "cover":
        return (
          <CoverSlide
            onEnter={() => goTo("market-overview")}
            isAuthenticated={isAuthenticated}
            userEmail={userEmail}
            onLoginSuccess={handleLoginSuccess}
            onLogout={handleLogout}
            shakeAlert={shakeAlert}
          />
        )
      case "market-overview": return <MarketOverviewSlide />
      case "news-research":   return <NewsResearchSlide />
      case "news-element":    return <NewsElementSlide />
    }
  }

  const isCover = current === "cover"

  return (
    <div className="flex flex-col h-screen bg-[#0A0D12] text-zinc-100 overflow-hidden select-none">
      {/* App Splash Screen */}
      <SplashScreen />

      {/* Top Status Bar (hidden on cover) */}
      {!isCover && (
        <header className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800/60 bg-[#0D1117] px-4 z-20">
          {/* Brand */}
          <button
            onClick={() => goTo("cover")}
            title="Kembali ke Halaman Pembuka (Tekan tombol '0')"
            className="flex items-center gap-2 hover:opacity-80 transition-all duration-150 cursor-pointer text-left focus:outline-none"
          >
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30">
              <BarChart3 className="h-3.5 w-3.5 text-amber-400" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">ZenFX</span>
            <span className="text-zinc-700 text-xs ml-1">· Personal Suite</span>
          </button>

          {/* Center: breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            {SLIDES.filter((s) => s.id !== "cover").map((s, i, arr) => (
              <span key={s.id} className="flex items-center gap-1.5">
                <button
                  onClick={() => goTo(s.id)}
                  className={`hover:text-zinc-200 transition-colors cursor-pointer ${current === s.id ? "text-amber-400 font-semibold" : ""}`}
                >
                  {s.label}
                </button>
                {i < arr.length - 1 && <span className="text-zinc-700">/</span>}
              </span>
            ))}
          </div>

          {/* Right: user badge + market status + clock */}
          <div className="flex items-center gap-3">
            {/* User session badge */}
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full font-medium">
              <UserCheck className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{userEmail || "Zen Trader"}</span>
              <button
                onClick={handleLogout}
                className="ml-1 text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="h-3 w-3" />
              </button>
            </div>

            <div className={`flex items-center gap-1.5 text-[11px] ${marketOpen ? "text-emerald-400" : "text-zinc-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${marketOpen ? "bg-emerald-400 animate-pulse" : "bg-zinc-600"}`} />
              {marketOpen ? (sessions.length > 0 ? sessions.join(" · ") : "Open") : "Closed"}
            </div>
            <span className="text-[11px] font-mono text-zinc-600">UTC {utcTime}</span>
          </div>
        </header>
      )}

      {/* Slide Viewport */}
      <main className="relative flex-1 overflow-hidden">
        {/* Outgoing slide */}
        {prev && (
          <div
            className={`absolute inset-0 z-10 pointer-events-none ${
              direction === "left" ? "slide-out-left" : "slide-out-right"
            }`}
          >
            {renderSlide(prev)}
          </div>
        )}

        {/* Incoming / current slide */}
        <div
          className={`absolute inset-0 z-20 ${
            animating
              ? direction === "left"
                ? "slide-in-right"
                : "slide-in-left"
              : ""
          }`}
        >
          {renderSlide(current)}
        </div>
      </main>

      {/* Bottom Navigation Dock (hidden on cover) */}
      {!isCover && (
        <nav className="flex items-center justify-center gap-1.5 h-12 shrink-0 border-t border-zinc-800/60 bg-[#0D1117] px-4 z-20">
          {SLIDES.filter((s) => s.id !== "cover").map((slide) => {
            const Icon = slide.icon
            const isActive = current === slide.id
            return (
              <button
                key={slide.id}
                onClick={() => goTo(slide.id)}
                title={`${slide.label} (${slide.shortcut})`}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-amber-500/15 border-amber-500/35 text-amber-400 shadow-lg shadow-amber-500/10"
                    : "border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{slide.label}</span>
                <kbd className={`hidden lg:inline text-[9px] px-1 py-0.5 rounded border font-mono ${isActive ? "border-amber-500/30 text-amber-500/60" : "border-zinc-700/50 text-zinc-700"}`}>
                  {slide.shortcut}
                </kbd>
              </button>
            )
          })}
        </nav>
      )}
    </div>
  )
}
