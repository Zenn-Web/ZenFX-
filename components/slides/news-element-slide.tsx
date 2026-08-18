"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  Zap,
  Search,
  X,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Pin,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/* Types */
type ImpactLevel = "very-high" | "high"

interface Indicator {
  id: string
  name: string
  fullName: string
  unit: string
  previous: number | string
  actual: number | string
  forecast: number | string
  sourceUrl: string
  color: string
  colorClass: string
  impact: ImpactLevel
  isNote?: boolean
  description: string
}

/* Data - FRED compatible indicators */
const INITIAL_INDICATORS: Indicator[] = [
  // Very High
  {
    id: "cpi", name: "CPI", fullName: "Consumer Price Index",
    unit: "%", previous: 2.1, actual: 2.4, forecast: 2.3,
    color: "#639cff", colorClass: "text-blue-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/CPIAUCSL",
    description: "Indikator inflasi utama yang diperhatikan Fed. Deviasi besar = sinyal kuat pergerakan USD.",
  },
  {
    id: "core-cpi", name: "Core CPI", fullName: "Core Consumer Price Index",
    unit: "%", previous: 2.0, actual: 2.2, forecast: 2.1,
    color: "#639cff", colorClass: "text-blue-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/CPILFESL",
    description: "CPI tanpa pangan & energi. Lebih stabil dan lebih diperhatikan Fed untuk keputusan rate.",
  },
  {
    id: "ppi", name: "PPI", fullName: "Producer Price Index",
    unit: "%", previous: 1.8, actual: 2.0, forecast: 1.9,
    color: "#ff7f50", colorClass: "text-orange-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/PPIACO",
    description: "Harga di tingkat produsen. Leading indicator inflasi CPI — produsen meneruskan kenaikan ke konsumen.",
  },
  {
    id: "core-ppi", name: "Core PPI", fullName: "Core Producer Price Index",
    unit: "%", previous: 1.6, actual: 1.9, forecast: 1.8,
    color: "#ff7f50", colorClass: "text-orange-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/PPIFID",
    description: "PPI tanpa pangan & energi. Sinyal tekanan inflasi produsen yang lebih bersih.",
  },
  {
    id: "pce", name: "PCE", fullName: "Personal Consumption Expenditures",
    unit: "%", previous: 2.5, actual: 2.7, forecast: 2.6,
    color: "#62c55c", colorClass: "text-emerald-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/PCEPI",
    description: "Ukuran inflasi pilihan Federal Reserve. Lebih luas cakupannya dibanding CPI.",
  },
  {
    id: "core-pce", name: "Core PCE", fullName: "Core Personal Consumption Expenditures",
    unit: "%", previous: 2.3, actual: 2.5, forecast: 2.4,
    color: "#62c55c", colorClass: "text-emerald-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/PCEPILFE",
    description: "Target inflasi resmi Fed 2%. Deviasi sekecil apapun langsung mempengaruhi ekspektasi rate.",
  },
  {
    id: "nfp", name: "NFP", fullName: "Non‑Farm Payroll",
    unit: "k", previous: 210, actual: 255, forecast: 240,
    color: "#ffbf00", colorClass: "text-amber-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/PAYEMS",
    description: "Paling ditunggu pasar — sering memicu volatilitas besar pada DXY & XAUUSD setiap awal bulan.",
  },
  {
    id: "unemployment", name: "Unemployment", fullName: "Unemployment Rate",
    unit: "%", previous: 5.4, actual: 5.2, forecast: 5.3,
    color: "#ff6b6b", colorClass: "text-red-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/UNRATE",
    description: "Bagian dari dual mandate Fed. Penurunan = ekonomi kuat = potensi kebijakan lebih ketat.",
  },
  {
    id: "hourly-earnings", name: "Avg Hourly Earn.", fullName: "Average Hourly Earnings",
    unit: "$", previous: 29.0, actual: 30.2, forecast: 29.8,
    color: "#c084fc", colorClass: "text-purple-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/CES0500000003",
    description: "Kenaikan upah mendorong inflasi via daya beli konsumen. Diperhatikan bersama NFP.",
  },
  {
    id: "gdp", name: "GDP", fullName: "Gross Domestic Product (QoQ)",
    unit: "%", previous: 2.1, actual: 2.4, forecast: 2.3,
    color: "#34d399", colorClass: "text-teal-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/A191RL1Q225SBEA",
    description: "2 kuartal negatif berturut-turut = resesi. Indikator kesehatan ekonomi paling menyeluruh.",
  },
  {
    id: "retail-sales", name: "Retail Sales", fullName: "Retail Sales (MoM)",
    unit: "%", previous: 0.5, actual: 0.7, forecast: 0.6,
    color: "#fbbf24", colorClass: "text-yellow-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/RSAFS",
    description: "Belanja konsumen ≈ 70% PDB AS. Penurunan signifikan = sinyal perlambatan ekonomi.",
  },
  {
    id: "fomc-rate", name: "FOMC Rate", fullName: "Federal Funds Rate",
    unit: "%", previous: 5.0, actual: 5.25, forecast: 5.25,
    color: "#f87171", colorClass: "text-rose-400", impact: "very-high",
    sourceUrl: "https://fred.stlouisfed.org/series/FEDFUNDS",
    description: "Event paling volatil. Setiap perubahan 25 bps berdampak besar pada DXY & emas.",
  },
  // High
  {
    id: "durable-goods", name: "Durable Goods", fullName: "Durable Goods Orders (MoM)",
    unit: "%", previous: -0.5, actual: 0.2, forecast: 0.1,
    color: "#ff7f50", colorClass: "text-orange-400", impact: "high",
    sourceUrl: "https://fred.stlouisfed.org/series/DGORDER",
    description: "Pesanan barang tahan lama (masa pakai ≥ 3 tahun). Cermin kepercayaan & investasi bisnis.",
  },
  {
    id: "consumer-spend", name: "Consumer Spending", fullName: "Personal Consumer Spending (YoY)",
    unit: "%", previous: 3.2, actual: 3.5, forecast: 3.4,
    color: "#c084fc", colorClass: "text-purple-400", impact: "high",
    sourceUrl: "https://fred.stlouisfed.org/series/PCE",
    description: "Komponen terbesar PDB AS. Penurunan signifikan = sinyal perlambatan konsumsi.",
  },
  {
    id: "factory-orders", name: "Factory Orders", fullName: "Factory Orders (MoM)",
    unit: "%", previous: -0.4, actual: 0.1, forecast: 0.0,
    color: "#34d399", colorClass: "text-teal-400", impact: "high",
    sourceUrl: "https://fred.stlouisfed.org/series/AMTMNO",
    description: "Total pesanan ke pabrik AS termasuk barang non-durable. Indikator aktivitas industri.",
  },
  {
    id: "jolts", name: "JOLTS", fullName: "Job Openings & Labor Turnover Survey",
    unit: "M", previous: 9.6, actual: 9.8, forecast: 9.7,
    color: "#60a5fa", colorClass: "text-blue-300", impact: "high",
    sourceUrl: "https://fred.stlouisfed.org/series/JTSJOL",
    description: "Jumlah lowongan kerja terbuka. Powell sering mengutip JOLTS di konferensi pers Fed.",
  },
]

/* Sparkline URL (QuickChart) */
function sparklineUrl(ind: Indicator): string {
  if (ind.isNote) return ""
  const prev = typeof ind.previous === "number" ? ind.previous : parseFloat(String(ind.previous))
  const fc   = typeof ind.forecast === "number" ? ind.forecast : parseFloat(String(ind.forecast))
  const act  = typeof ind.actual   === "number" ? ind.actual   : parseFloat(String(ind.actual))
  if (isNaN(prev) || isNaN(fc) || isNaN(act)) return ""

  return (
    "https://quickchart.io/chart?w=88&h=32&bkg=transparent&c=" +
    encodeURIComponent(
      JSON.stringify({
        type: "line",
        data: {
          labels: ["Prev", "Est", "Act"],
          datasets: [{
            data: [prev, fc, act],
            borderColor: ind.color,
            borderWidth: 1.5,
            pointRadius: [2, 2, 3],
            pointBackgroundColor: [ind.color, ind.color, ind.color],
            fill: false,
            tension: 0.3,
          }],
        },
        options: {
          legend: { display: false },
          scales: {
            xAxes: [{ display: false }],
            yAxes: [{ display: false }],
          },
        },
      })
    )
  )
}

/* Helpers */
function getDeviation(ind: Indicator): number | null {
  if (ind.isNote) return null
  const a = typeof ind.actual   === "number" ? ind.actual   : parseFloat(String(ind.actual))
  const f = typeof ind.forecast === "number" ? ind.forecast : parseFloat(String(ind.forecast))
  if (isNaN(a) || isNaN(f) || f === 0) return null
  return ((a - f) / Math.abs(f)) * 100
}

function fmt(v: number | string, unit: string): string {
  if (v === "—" || v === "") return "—"
  const n = typeof v === "number" ? v : parseFloat(String(v))
  if (isNaN(n)) return String(v)
  if (unit === "k") return `${n}k`
  if (unit === "M bbl") return `${n}M`
  return `${n}${unit}`
}

/* Breaking Banner */
function BreakingBanner({ indicators }: { indicators: Indicator[] }) {
  const hits = indicators.filter((i) => {
    const d = getDeviation(i)
    return d !== null && Math.abs(d) > 0.5
  })
  if (hits.length === 0) return null
  return (
    <div
      role="alert"
      aria-live="polite"
      className="flex items-center gap-3 px-4 py-1.5 bg-gradient-to-r from-red-950/70 via-red-900/40 to-transparent border-b border-red-500/30 shrink-0 overflow-hidden"
    >
      <span className="flex items-center gap-1.5 shrink-0">
        <AlertTriangle className="h-3 w-3 text-red-400 animate-pulse" />
        <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Breaking</span>
      </span>
      <div className="flex items-center gap-5 overflow-x-auto scrollbar-none">
        {hits.map((ind) => {
          const d = getDeviation(ind)!
          return (
            <span key={ind.id} className="flex items-center gap-1 text-[11px] whitespace-nowrap shrink-0 text-zinc-300">
              <span className={`font-bold ${ind.colorClass}`}>{ind.name}</span>
              <span className="text-zinc-700 mx-0.5">·</span>
              <span>Actual {fmt(ind.actual, ind.unit)}</span>
              <span className={`font-mono font-bold ml-1 ${d > 0 ? "text-emerald-400" : "text-red-400"}`}>
                {d > 0 ? "▲" : "▼"}{Math.abs(d).toFixed(1)}% vs forecast
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* Deviation Cell */
function DeviationCell({ ind }: { ind: Indicator }) {
  if (ind.isNote) return <span className="text-zinc-800 text-[10px] font-mono">—</span>
  const d = getDeviation(ind)
  if (d === null) return <span className="text-zinc-700">—</span>
  if (Math.abs(d) < 0.001)
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] text-zinc-600 font-mono">
        <Minus className="h-2.5 w-2.5" /> 0.0%
      </span>
    )
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold ${d > 0 ? "text-emerald-400" : "text-red-400"}`}>
      {d > 0 ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {d > 0 ? "+" : ""}{d.toFixed(1)}%
    </span>
  )
}

/* Table Row */
function IndicatorRow({
  ind,
  rank,
  pinned,
  onTogglePin,
}: {
  ind: Indicator
  rank: number
  pinned: boolean
  onTogglePin: (id: string) => void
}) {
  const spark = sparklineUrl(ind)

  const ariaLabel = ind.isNote
    ? `${ind.fullName}: event, klik sumber untuk detail`
    : `${ind.fullName}, previous ${fmt(ind.previous, ind.unit)}, actual ${fmt(ind.actual, ind.unit)}, forecast ${fmt(ind.forecast, ind.unit)}`

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <tr
          aria-label={ariaLabel}
          tabIndex={0}
          className="group border-b border-zinc-800/40 hover:bg-zinc-800/25 focus-visible:outline-none focus-visible:bg-zinc-800/30 transition-colors cursor-default"
        >
          {/* Pin button */}
          <td className="pl-3 pr-1 py-2 w-8">
            <button
              onClick={(e) => { e.stopPropagation(); onTogglePin(ind.id) }}
              aria-label={pinned ? `Unpin ${ind.name}` : `Pin ${ind.name} ke watchlist`}
              className={`flex items-center justify-center w-5 h-5 rounded transition-all ${
                pinned
                  ? "text-amber-400 hover:text-amber-300"
                  : "text-zinc-700 hover:text-zinc-400 opacity-0 group-hover:opacity-100"
              }`}
            >
              <Pin className={`h-3 w-3 ${pinned ? "fill-amber-400" : ""}`} />
            </button>
          </td>

          {/* Rank */}
          <td className="pr-2 py-2 text-[10px] text-zinc-700 font-mono w-6">
            {rank}
          </td>

          {/* Name */}
          <td className="pr-4 py-2 w-36">
            <div className="flex flex-col gap-0.5">
              <span className={`text-[12px] font-bold leading-tight ${ind.colorClass}`}>
                {ind.name}
              </span>
              <span className="text-[10px] text-zinc-600 leading-tight hidden sm:block truncate max-w-[130px]">
                {ind.fullName}
              </span>
            </div>
          </td>

          {/* Sparkline */}
          <td className="px-2 py-2 w-24">
            {!ind.isNote && spark ? (
              <img
                src={spark}
                alt={`${ind.name} trend: prev ${fmt(ind.previous, ind.unit)}, forecast ${fmt(ind.forecast, ind.unit)}, actual ${fmt(ind.actual, ind.unit)}`}
                width={88}
                height={32}
                className="rounded opacity-60 group-hover:opacity-100 transition-opacity"
              />
            ) : (
              <span className="text-[10px] text-zinc-800 font-mono">—</span>
            )}
          </td>

          {/* Previous */}
          <td className="px-3 py-2 text-right text-[11px] font-mono text-zinc-600 w-20">
            {fmt(ind.previous, ind.unit)}
          </td>

          {/* Forecast */}
          <td className="px-3 py-2 text-right text-[11px] font-mono text-zinc-500 w-20">
            {fmt(ind.forecast, ind.unit)}
          </td>

          {/* Actual */}
          <td className="px-3 py-2 text-right w-24">
            {ind.isNote ? (
              <span className="text-[10px] text-zinc-700 font-mono px-2 py-0.5 rounded border border-zinc-800/50">EVENT</span>
            ) : (
              <span className={`text-[13px] font-bold font-mono ${ind.colorClass}`}>
                {fmt(ind.actual, ind.unit)}
              </span>
            )}
          </td>

          {/* Deviation */}
          <td className="px-3 py-2 text-right w-24">
            <DeviationCell ind={ind} />
          </td>

          {/* Source */}
          <td className="pr-3 pl-1 py-2 text-right w-8">
            <a
              href={ind.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Sumber FRED untuk ${ind.name}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center justify-center w-6 h-6 rounded hover:bg-zinc-700/40 text-zinc-700 hover:text-amber-400 transition-colors"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          </td>
        </tr>
      </TooltipTrigger>

      <TooltipContent
        side="left"
        align="center"
        className="max-w-[220px] bg-[#161b22] border border-zinc-700/60 text-zinc-300 text-[11px] leading-relaxed p-3 rounded-xl shadow-xl"
      >
        <p className="font-semibold text-white mb-1">{ind.fullName}</p>
        <p>{ind.description}</p>
        {!ind.isNote && (
          <p className="mt-2 text-zinc-600 font-mono text-[10px]">
            FRED · Data dari sumber resmi Federal Reserve
          </p>
        )}
      </TooltipContent>
    </Tooltip>
  )
}

/* Table header */
function TableHead() {
  return (
    <thead>
      <tr className="border-b border-zinc-800/60 bg-[#0D1117]">
        <th className="pl-3 pr-1 py-1.5 w-8" />
        <th className="pr-2 py-1.5 w-6" />
        <th className="pr-4 py-1.5 text-left text-[10px] text-zinc-600 font-medium uppercase tracking-wider">
          Indicator
        </th>
        <th className="px-2 py-1.5 text-left text-[10px] text-zinc-600 font-medium uppercase tracking-wider w-24">
          Trend
        </th>
        <th className="px-3 py-1.5 text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider w-20">Prev</th>
        <th className="px-3 py-1.5 text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider w-20">Forecast</th>
        <th className="px-3 py-1.5 text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider w-24">Actual</th>
        <th className="px-3 py-1.5 text-right text-[10px] text-zinc-600 font-medium uppercase tracking-wider w-24">Deviation</th>
        <th className="pr-3 pl-1 py-1.5 w-8" />
      </tr>
    </thead>
  )
}

/* Collapsible Section */
function IndicatorSection({
  label,
  level,
  indicators,
  pinnedIds,
  onTogglePin,
  defaultOpen = true,
}: {
  label: string
  level: ImpactLevel
  indicators: Indicator[]
  pinnedIds: Set<string>
  onTogglePin: (id: string) => void
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  if (indicators.length === 0) return null

  return (
    <div className="rounded-xl border border-zinc-800/50 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={`w-full flex items-center justify-between px-4 py-2 text-left transition-colors ${
          level === "very-high"
            ? "bg-amber-500/6 hover:bg-amber-500/10"
            : "bg-zinc-900/40 hover:bg-zinc-800/40"
        }`}
      >
        <div className="flex items-center gap-2">
          {level === "very-high"
            ? <Star className="h-3 w-3 text-amber-500" fill="currentColor" />
            : <Zap className="h-3 w-3 text-blue-400" />}
          <span className={`text-[11px] font-bold uppercase tracking-widest ${level === "very-high" ? "text-amber-400" : "text-blue-300"}`}>
            {label}
          </span>
          <span className="text-[10px] text-zinc-700 font-mono">{indicators.length}</span>
        </div>
        {open
          ? <ChevronUp className="h-3.5 w-3.5 text-zinc-600" />
          : <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />}
      </button>

      {open && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left border-collapse">
            <TableHead />
            <tbody>
              {indicators.map((ind, i) => (
                <IndicatorRow
                  key={ind.id}
                  ind={ind}
                  rank={i + 1}
                  pinned={pinnedIds.has(ind.id)}
                  onTogglePin={onTogglePin}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

/* Pinned / Watchlist Section */
function WatchlistSection({
  indicators,
  pinnedIds,
  onTogglePin,
}: {
  indicators: Indicator[]
  pinnedIds: Set<string>
  onTogglePin: (id: string) => void
}) {
  const pinned = indicators.filter((i) => pinnedIds.has(i.id))
  if (pinned.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-500/25 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/8 border-b border-amber-500/20">
        <Pin className="h-3 w-3 text-amber-400 fill-amber-400" />
        <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Watchlist</span>
        <span className="text-[10px] text-zinc-700 font-mono">{pinned.length} pinned</span>
        <span className="ml-auto text-[10px] text-zinc-700">Hover baris → info · Pin icon untuk unpin</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left border-collapse">
          <TableHead />
          <tbody>
            {pinned.map((ind, i) => (
              <IndicatorRow
                key={ind.id}
                ind={ind}
                rank={i + 1}
                pinned={true}
                onTogglePin={onTogglePin}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* Main Slide */
const LS_KEY = "zenfx_pinned_indicators"

export function NewsElementSlide() {
  const [query, setQuery] = useState("")
  const [indicators, setIndicators] = useState<Indicator[]>(INITIAL_INDICATORS)
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [source, setSource] = useState<string>("local")

  const fetchIndicators = async (silent = false) => {
    if (!silent) setIsLoading(true)
    try {
      const res = await fetch("/api/economic-indicators")
      if (res.ok) {
        const data = await res.json()
        if (data.indicators) {
          setIndicators(data.indicators)
          setSource(data.source)
        }
      }
    } catch (err) {
      console.error("Failed to load economic indicators", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Load pinned from localStorage and fetch live indicators on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_KEY)
      if (saved) setPinnedIds(new Set(JSON.parse(saved) as string[]))
    } catch {}

    fetchIndicators()
  }, [])

  // Persist pinned to localStorage
  const togglePin = useCallback((id: string) => {
    setPinnedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(LS_KEY, JSON.stringify([...next])) } catch {}
      return next
    })
  }, [])

  const handleSearch = useCallback((v: string) => setQuery(v), [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return indicators
    return indicators.filter(
      (i) => i.name.toLowerCase().includes(q) || i.fullName.toLowerCase().includes(q)
    )
  }, [query, indicators])

  const veryHigh = useMemo(() => filtered.filter((i) => i.impact === "very-high"), [filtered])
  const high     = useMemo(() => filtered.filter((i) => i.impact === "high"),      [filtered])

  return (
    <div className="flex flex-col h-full w-full bg-[#0A0D12] text-zinc-100 overflow-hidden">

      {/* Breaking Banner */}
      <BreakingBanner indicators={indicators} />

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 py-1.5 min-h-10 shrink-0 border-b border-zinc-800/60 bg-[#0D1117]">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-sm font-bold text-white">News Element</span>
          <span className="text-zinc-700 text-xs hidden sm:inline">· Economic Calendar</span>
          {pinnedIds.size > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-amber-400/70 font-mono ml-1">
              <Pin className="h-2.5 w-2.5 fill-amber-400/70" />
              {pinnedIds.size}
            </span>
          )}
          <span className={`text-[9px] px-1.5 py-0.5 rounded ml-2 font-mono ${
            source === "fred" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700"
          }`}>
            {source === "fred" ? "LIVE FRED" : "OFFLINE DEMO"}
          </span>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-2">
          {isLoading && (
            <span className="text-[10px] text-zinc-500 animate-pulse mr-1">Loading data...</span>
          )}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-zinc-600 pointer-events-none" />
            <input
              id="indicator-search"
              type="search"
              placeholder="Cari indikator…"
              aria-label="Cari indikator ekonomi"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-zinc-900/60 border border-zinc-800/50 rounded-lg pl-7 pr-7 py-1 text-[11px] text-zinc-300 placeholder:text-zinc-700 focus:outline-none focus:border-amber-500/40 w-32 sm:w-44 transition-all"
            />
            {query && (
              <button
                onClick={() => handleSearch("")}
                aria-label="Hapus pencarian"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-700">
            <Search className="h-7 w-7 mb-3 opacity-40" />
            <p className="text-sm">Tidak ada hasil untuk &ldquo;{query}&rdquo;</p>
          </div>
        ) : (
          <>
            {/* Watchlist always on top */}
            {!query && (
              <WatchlistSection
                indicators={indicators}
                pinnedIds={pinnedIds}
                onTogglePin={togglePin}
              />
            )}

            <IndicatorSection
              label="⭐⭐⭐⭐⭐ Very High Impact"
              level="very-high"
              indicators={veryHigh}
              pinnedIds={pinnedIds}
              onTogglePin={togglePin}
              defaultOpen={true}
            />
            <IndicatorSection
              label="⭐⭐⭐⭐ High Impact"
              level="high"
              indicators={high}
              pinnedIds={pinnedIds}
              onTogglePin={togglePin}
              defaultOpen={false}
            />
          </>
        )}

        <p className="text-center text-[10px] text-zinc-800 italic pb-1">
          Data via FRED (Federal Reserve) · Read-only · Keputusan trading sepenuhnya ada di tangan trader
        </p>
      </div>
    </div>
  )
}
