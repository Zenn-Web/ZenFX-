import { NextResponse } from "next/server"

// Cache duration: 1 hour (3600 seconds)
export const revalidate = 3600

interface FredObservation {
  date: string
  value: string
}

interface IndicatorConfig {
  id: string
  name: string
  fullName: string
  unit: string
  color: string
  colorClass: string
  impact: "very-high" | "high"
  description: string
  seriesId: string
  units: "pc1" | "lin"
  transform?: "diff" | "pct_change" | "jolts_m" | "direct"
  forecast: number // Hardcoded default forecast consensus
}

const INDICATOR_CONFIGS: IndicatorConfig[] = [
  // Very High
  {
    id: "cpi", name: "CPI", fullName: "Consumer Price Index",
    unit: "%", color: "#639cff", colorClass: "text-blue-400", impact: "very-high",
    seriesId: "CPIAUCSL", units: "pc1", transform: "direct", forecast: 2.3,
    description: "Indikator inflasi utama yang diperhatikan Fed. Deviasi besar = sinyal kuat pergerakan USD.",
  },
  {
    id: "core-cpi", name: "Core CPI", fullName: "Core Consumer Price Index",
    unit: "%", color: "#639cff", colorClass: "text-blue-400", impact: "very-high",
    seriesId: "CPILFESL", units: "pc1", transform: "direct", forecast: 2.1,
    description: "CPI tanpa pangan & energi. Lebih stabil dan lebih diperhatikan Fed untuk keputusan rate.",
  },
  {
    id: "ppi", name: "PPI", fullName: "Producer Price Index",
    unit: "%", color: "#ff7f50", colorClass: "text-orange-400", impact: "very-high",
    seriesId: "PPIACO", units: "pc1", transform: "direct", forecast: 1.9,
    description: "Harga di tingkat produsen. Leading indicator inflasi CPI — produsen meneruskan kenaikan ke konsumen.",
  },
  {
    id: "core-ppi", name: "Core PPI", fullName: "Core Producer Price Index",
    unit: "%", color: "#ff7f50", colorClass: "text-orange-400", impact: "very-high",
    seriesId: "PPIFID", units: "pc1", transform: "direct", forecast: 1.8,
    description: "PPI tanpa pangan & energi. Sinyal tekanan inflasi produsen yang lebih bersih.",
  },
  {
    id: "pce", name: "PCE", fullName: "Personal Consumption Expenditures",
    unit: "%", color: "#62c55c", colorClass: "text-emerald-400", impact: "very-high",
    seriesId: "PCEPI", units: "pc1", transform: "direct", forecast: 2.6,
    description: "Ukuran inflasi pilihan Federal Reserve. Lebih luas cakupannya dibanding CPI.",
  },
  {
    id: "core-pce", name: "Core PCE", fullName: "Core Personal Consumption Expenditures",
    unit: "%", color: "#62c55c", colorClass: "text-emerald-400", impact: "very-high",
    seriesId: "PCEPILFE", units: "pc1", transform: "direct", forecast: 2.4,
    description: "Target inflasi resmi Fed 2%. Deviasi sekecil apapun langsung mempengaruhi ekspektasi rate.",
  },
  {
    id: "nfp", name: "NFP", fullName: "Non‑Farm Payroll",
    unit: "k", color: "#ffbf00", colorClass: "text-amber-400", impact: "very-high",
    seriesId: "PAYEMS", units: "lin", transform: "diff", forecast: 240,
    description: "Paling ditunggu pasar — sering memicu volatilitas besar pada DXY & XAUUSD setiap awal bulan.",
  },
  {
    id: "unemployment", name: "Unemployment", fullName: "Unemployment Rate",
    unit: "%", color: "#ff6b6b", colorClass: "text-red-400", impact: "very-high",
    seriesId: "UNRATE", units: "lin", transform: "direct", forecast: 5.3,
    description: "Bagian dari dual mandate Fed. Penurunan = ekonomi kuat = potensi kebijakan lebih ketat.",
  },
  {
    id: "hourly-earnings", name: "Avg Hourly Earn.", fullName: "Average Hourly Earnings",
    unit: "$", color: "#c084fc", colorClass: "text-purple-400", impact: "very-high",
    seriesId: "CES0500000003", units: "lin", transform: "direct", forecast: 29.8,
    description: "Kenaikan upah mendorong inflasi via daya beli konsumen. Diperhatikan bersama NFP.",
  },
  {
    id: "gdp", name: "GDP", fullName: "Gross Domestic Product (QoQ)",
    unit: "%", color: "#34d399", colorClass: "text-teal-400", impact: "very-high",
    seriesId: "A191RL1Q225SBEA", units: "lin", transform: "direct", forecast: 2.3,
    description: "2 kuartal negatif berturut-turut = resesi. Indikator kesehatan ekonomi paling menyeluruh.",
  },
  {
    id: "retail-sales", name: "Retail Sales", fullName: "Retail Sales (MoM)",
    unit: "%", color: "#fbbf24", colorClass: "text-yellow-400", impact: "very-high",
    seriesId: "RSAFS", units: "lin", transform: "pct_change", forecast: 0.6,
    description: "Belanja konsumen ≈ 70% PDB AS. Penurunan signifikan = sinyal perlambatan ekonomi.",
  },
  {
    id: "fomc-rate", name: "FOMC Rate", fullName: "Federal Funds Rate",
    unit: "%", color: "#f87171", colorClass: "text-rose-400", impact: "very-high",
    seriesId: "FEDFUNDS", units: "lin", transform: "direct", forecast: 5.25,
    description: "Event paling volatil. Setiap perubahan 25 bps berdampak besar pada DXY & emas.",
  },
  // High
  {
    id: "durable-goods", name: "Durable Goods", fullName: "Durable Goods Orders (MoM)",
    unit: "%", color: "#ff7f50", colorClass: "text-orange-400", impact: "high",
    seriesId: "DGORDER", units: "lin", transform: "pct_change", forecast: 0.1,
    description: "Pesanan barang tahan lama (masa pakai ≥ 3 tahun). Cermin kepercayaan & investasi bisnis.",
  },
  {
    id: "consumer-spend", name: "Consumer Spending", fullName: "Personal Consumer Spending (YoY)",
    unit: "%", color: "#c084fc", colorClass: "text-purple-400", impact: "high",
    seriesId: "PCE", units: "pc1", transform: "direct", forecast: 3.4,
    description: "Komponen terbesar PDB AS. Penurunan signifikan = sinyal perlambatan konsumsi.",
  },
  {
    id: "factory-orders", name: "Factory Orders", fullName: "Factory Orders (MoM)",
    unit: "%", color: "#34d399", colorClass: "text-teal-400", impact: "high",
    seriesId: "AMTMNO", units: "lin", transform: "pct_change", forecast: 0.0,
    description: "Total pesanan ke pabrik AS termasuk barang non-durable. Indikator aktivitas industri.",
  },
  {
    id: "jolts", name: "JOLTS", fullName: "Job Openings & Labor Turnover Survey",
    unit: "M", color: "#60a5fa", colorClass: "text-blue-300", impact: "high",
    seriesId: "JTSJOL", units: "lin", transform: "jolts_m", forecast: 9.7,
    description: "Jumlah lowongan kerja terbuka. Powell sering mengutip JOLTS di konferensi pers Fed.",
  },
]

async function fetchFromFred(seriesId: string, units: string, limit: number, apiKey: string): Promise<FredObservation[]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}&units=${units}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`FRED fetch failed for ${seriesId}: ${res.statusText}`)
  }
  const data = await res.json()
  return data.observations || []
}

export async function GET() {
  const apiKey = process.env.FRED_API_KEY

  // If no FRED key is found, return the static indicators as a fallback
  if (!apiKey) {
    const fallbackIndicators = INDICATOR_CONFIGS.map((cfg) => {
      // Return default mock values defined in news-element-slide config
      let actual: number = 0
      let previous: number = 0
      switch (cfg.id) {
        case "cpi":             actual = 2.4; previous = 2.1; break
        case "core-cpi":        actual = 2.2; previous = 2.0; break
        case "ppi":             actual = 2.0; previous = 1.8; break
        case "core-ppi":        actual = 1.9; previous = 1.6; break
        case "pce":             actual = 2.7; previous = 2.5; break
        case "core-pce":        actual = 2.5; previous = 2.3; break
        case "nfp":             actual = 255; previous = 210; break
        case "unemployment":    actual = 5.2; previous = 5.4; break
        case "hourly-earnings": actual = 30.2; previous = 29.0; break
        case "gdp":             actual = 2.4; previous = 2.1; break
        case "retail-sales":    actual = 0.7; previous = 0.5; break
        case "fomc-rate":       actual = 5.25; previous = 5.0; break
        case "durable-goods":   actual = 0.2; previous = -0.5; break
        case "consumer-spend":  actual = 3.5; previous = 3.2; break
        case "factory-orders":  actual = 0.1; previous = -0.4; break
        case "jolts":           actual = 9.8; previous = 9.6; break
      }
      return {
        id: cfg.id,
        name: cfg.name,
        fullName: cfg.fullName,
        unit: cfg.unit,
        previous,
        actual,
        forecast: cfg.forecast,
        sourceUrl: `https://fred.stlouisfed.org/series/${cfg.seriesId}`,
        color: cfg.color,
        colorClass: cfg.colorClass,
        impact: cfg.impact,
        description: cfg.description,
      }
    })

    return NextResponse.json({
      indicators: fallbackIndicators,
      source: "local_fallback",
      message: "FRED_API_KEY is not defined in environment variables. Using local fallback data.",
    })
  }

  try {
    const promises = INDICATOR_CONFIGS.map(async (cfg) => {
      try {
        // limit: 3 observations needed for diff/pct_change transformations
        const limit = cfg.transform === "diff" || cfg.transform === "pct_change" ? 3 : 2
        const obs = await fetchFromFred(cfg.seriesId, cfg.units, limit, apiKey)

        if (obs.length < 2) {
          throw new Error("Insufficient observations returned from FRED")
        }

        let actualVal = parseFloat(obs[0].value)
        let previousVal = parseFloat(obs[1].value)

        // Handle transforms
        if (cfg.transform === "diff" && obs.length >= 3) {
          // e.g. NFP PAYEMS (Total nonfarm employment change in thousands)
          actualVal = parseFloat(obs[0].value) - parseFloat(obs[1].value)
          previousVal = parseFloat(obs[1].value) - parseFloat(obs[2].value)
        } else if (cfg.transform === "pct_change" && obs.length >= 3) {
          // e.g. MoM% change
          const v0 = parseFloat(obs[0].value)
          const v1 = parseFloat(obs[1].value)
          const v2 = parseFloat(obs[2].value)
          actualVal = ((v0 - v1) / Math.abs(v1)) * 100
          previousVal = ((v1 - v2) / Math.abs(v2)) * 100
        } else if (cfg.transform === "jolts_m") {
          // JOLTS is reported in thousands, scale it down to Millions (e.g. 9600k -> 9.6M)
          actualVal = actualVal / 1000
          previousVal = previousVal / 1000
        }

        // Keep values neat (1 or 2 decimals)
        const formatValue = (v: number) => {
          if (isNaN(v)) return 0
          return parseFloat(v.toFixed(2))
        }

        return {
          id: cfg.id,
          name: cfg.name,
          fullName: cfg.fullName,
          unit: cfg.unit,
          previous: formatValue(previousVal),
          actual: formatValue(actualVal),
          forecast: cfg.forecast, // Consensus is hardcoded as FRED doesn't track forecast estimates
          sourceUrl: `https://fred.stlouisfed.org/series/${cfg.seriesId}`,
          color: cfg.color,
          colorClass: cfg.colorClass,
          impact: cfg.impact,
          description: cfg.description,
        }
      } catch (err) {
        console.error(`Error processing indicator ${cfg.id}:`, err)
        // Fallback for single indicator if it fails
        return {
          id: cfg.id,
          name: cfg.name,
          fullName: cfg.fullName,
          unit: cfg.unit,
          previous: "—",
          actual: "—",
          forecast: cfg.forecast,
          sourceUrl: `https://fred.stlouisfed.org/series/${cfg.seriesId}`,
          color: cfg.color,
          colorClass: cfg.colorClass,
          impact: cfg.impact,
          description: cfg.description,
        }
      }
    })

    const results = await Promise.all(promises)

    return NextResponse.json({
      indicators: results,
      source: "fred",
    })
  } catch (globalError: any) {
    return NextResponse.json(
      { error: "Failed to fetch FRED data", details: globalError.message },
      { status: 500 }
    )
  }
}
