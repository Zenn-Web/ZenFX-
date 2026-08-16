"use client"

import { useEffect, useState } from "react"
import { BarChart3, Lock, Mail, Key, LogIn, UserPlus, AlertCircle, CheckCircle2, LogOut } from "lucide-react"
import { supabase, signInWithGoogle } from "@/lib/supabaseClient"

interface CoverSlideProps {
  onEnter: () => void
  isAuthenticated?: boolean
  userEmail?: string | null
  onLoginSuccess?: (email: string) => void
  onLogout?: () => void
  shakeAlert?: boolean
}

export function CoverSlide({
  onEnter,
  isAuthenticated = false,
  userEmail = null,
  onLoginSuccess,
  onLogout,
  shakeAlert = false,
}: CoverSlideProps) {
  const [visible] = useState(true)
  const [showSub] = useState(true)
  const [showCard] = useState(true)

  // Auth form states
  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!email || !password) {
      setErrorMsg("Silakan isi email dan password terlebih dahulu.")
      return
    }

    setLoading(true)

    try {
      if (mode === "signin") {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) {
          setErrorMsg(error.message || "Gagal masuk. Periksa email & password Anda.")
        } else if (data.user) {
          setSuccessMsg("Berhasil masuk!")
          onLoginSuccess?.(data.user.email || email)
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) {
          setErrorMsg(error.message || "Gagal mendaftar akun baru.")
        } else if (data.user) {
          setSuccessMsg("Akun berhasil dibuat! Mengalihkan ke Market Overview...")
          onLoginSuccess?.(data.user.email || email)
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setErrorMsg(null)
    setLoading(true)
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setErrorMsg(error.message || "Gagal login dengan Google.")
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan login Google.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex flex-col items-center justify-center h-full w-full overflow-y-auto bg-[#0A0D12] select-none py-10">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div
          className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-amber-600/4 blur-[100px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
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
      <div className="relative z-10 flex flex-col items-center gap-5 px-6 text-center max-w-lg w-full">
        {/* Logo icon */}
        <div
          className="flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 shadow-lg shadow-amber-500/10"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "scale(1)" : "scale(0.8)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
          }}
        >
          <BarChart3 className="h-7 w-7 text-amber-400" />
        </div>

        {/* Welcome text */}
        <div
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease 0.1s, transform 0.6s ease 0.1s",
          }}
        >
          <p className="text-amber-400/70 text-xs font-medium tracking-[0.3em] uppercase mb-2">
            Private Forex &amp; Gold Suite
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
            ZenFX{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, #F0B90B 0%, #FFD700 40%, #F0B90B 70%, #B8860B 100%)",
              }}
            >
              Terminal
            </span>
          </h1>
        </div>

        {/* Subtitle */}
        <p
          className="text-zinc-400 text-sm max-w-sm leading-relaxed"
          style={{
            opacity: showSub ? 1 : 0,
            transform: showSub ? "translateY(0)" : "translateY(12px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          Riset pasar fundamental Forex &amp; Emas (XAUUSD), live news, dan kalender makro dalam satu ruang pribadi.
        </p>

        {/* Glassmorphic Auth Card */}
        <div
          className={`w-full mt-2 rounded-2xl p-6 transition-all duration-300 ${
            shakeAlert ? "animate-bounce border-red-500/60 shadow-red-500/20" : ""
          }`}
          style={{
            opacity: showCard ? 1 : 0,
            transform: showCard ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.6s ease, transform 0.6s ease",
            background: "rgba(18, 22, 31, 0.75)",
            backdropFilter: "blur(16px)",
            border: shakeAlert
              ? "1px solid rgba(239, 68, 68, 0.6)"
              : "1px solid rgba(240, 185, 11, 0.25)",
            boxShadow: shakeAlert
              ? "0 0 25px rgba(239, 68, 68, 0.15)"
              : "0 0 30px rgba(0, 0, 0, 0.5), 0 0 15px rgba(240, 185, 11, 0.05)",
          }}
        >
          {isAuthenticated ? (
            /* Authenticated State */
            <div className="flex flex-col items-center gap-4 py-2">
              <div className="flex items-center gap-2 text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Terautentikasi sebagai {userEmail || "Zen Trader"}</span>
              </div>

              <div className="flex items-center gap-3 w-full mt-2">
                <button
                  onClick={onEnter}
                  className="flex-1 py-3 px-4 rounded-xl font-semibold text-xs tracking-wide text-amber-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
                >
                  <span>Masuk ke Dashboard</span>
                  <span>→</span>
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="p-3 rounded-xl border border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Unauthenticated Auth Form */
            <div className="flex flex-col gap-4">
              {/* Tab Selector: Sign In vs Sign Up */}
              <div className="flex items-center p-1 bg-zinc-950/60 rounded-xl border border-zinc-800">
                <button
                  onClick={() => {
                    setMode("signin")
                    setErrorMsg(null)
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === "signin"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Masuk (Sign In)</span>
                </button>
                <button
                  onClick={() => {
                    setMode("signup")
                    setErrorMsg(null)
                  }}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                    mode === "signup"
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Daftar Akun</span>
                </button>
              </div>

              {/* Alert Notification */}
              {shakeAlert && !errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>⚠️ Silakan login terlebih dahulu untuk membuka Private Suite.</span>
                </div>
              )}

              {errorMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-950/60 border border-red-500/40 text-red-300 text-xs text-left">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs text-left">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Google OAuth Login Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800/80 text-zinc-200 text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 14.8s.7 5.1 1.9 7.5l3.7-2.9c-.6-.7-1-1.7-1-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
                  />
                </svg>
                <span>Lanjutkan dengan Google</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-2 my-0.5">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
                  atau Email
                </span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleAuthSubmit} className="flex flex-col gap-3">
                <div className="relative text-left">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-colors"
                  />
                </div>

                <div className="relative text-left">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (minimal 6 karakter)"
                    required
                    minLength={6}
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950/80 border border-zinc-800 focus:border-amber-500/60 rounded-xl text-xs text-zinc-200 placeholder-zinc-600 outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-1 py-2.5 px-4 rounded-xl font-semibold text-xs text-amber-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/15 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="animate-pulse">Memproses...</span>
                  ) : mode === "signin" ? (
                    <>
                      <span>Enter Private Suite</span>
                      <span>→</span>
                    </>
                  ) : (
                    <>
                      <span>Buat Akun Baru</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <p className="text-zinc-600 text-[11px] tracking-wide">
          Atau tekan tombol <kbd className="px-1.5 py-0.5 rounded text-[10px] border border-zinc-800 text-zinc-500 font-mono">→</kbd> di keyboard
        </p>
      </div>

      {/* Version tag */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        <span className="text-zinc-800 text-[10px] tracking-widest uppercase font-mono">
          ZenFX v2.1 · Protected Terminal Edition
        </span>
      </div>
    </div>
  )
}
