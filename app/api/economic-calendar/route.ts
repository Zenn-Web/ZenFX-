import { NextResponse } from "next/server"

export interface EconomicEvent {
  title: string
  country: string
  date: string       // ISO string
  impact: "High" | "Medium" | "Low"
  forecast: string
  previous: string
  actual: string
  unit: string
}

/**
 * Mata uang yang relevan untuk analisis XAUUSD:
 * - USD  : pengaruh langsung (DXY, Fed)
 * - EUR  : pasangan terbesar, sentimen risk global
 * - GBP  : korelasi kuat dengan risiko global
 * - JPY  : safe-haven companion (sering berkorelasi dengan Gold)
 */
const RELEVANT_CURRENCIES = ["USD", "EUR", "GBP", "JPY"]

/**
 * Sumber: ForexFactory JSON public feed (nfs.faireconomy.media)
 * Data: event minggu ini + minggu depan
 * Tidak perlu API key — gratis
 */
async function fetchForexFactoryCalendar(): Promise<EconomicEvent[]> {
  const urls = [
    "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
    "https://nfs.faireconomy.media/ff_calendar_nextweek.json",
  ]

  const allEvents: EconomicEvent[] = []

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        next: { revalidate: 60 * 15 }, // Cache 15 menit
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; ForexDashboard/1.0)",
        },
      })

      if (!res.ok) continue

      const data: any[] = await res.json()

      const mapped: EconomicEvent[] = data
        // Filter hanya mata uang yang relevan untuk XAUUSD
        .filter((e) => RELEVANT_CURRENCIES.includes(e.country))
        .map((e) => {
          const impact = mapImpact(e.impact)
          return {
            title: e.title || "Unknown Event",
            country: e.country,
            date: e.date || new Date().toISOString(),
            impact,
            forecast: e.forecast ?? "",
            previous: e.previous ?? "",
            actual: e.actual ?? "",
            unit: "",
          }
        })

      allEvents.push(...mapped)
    } catch {
      // Lanjut ke URL berikutnya jika gagal
      continue
    }
  }

  // Urutkan kronologis, High impact naik ke atas per slot waktu yang sama
  allEvents.sort((a, b) => {
    const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime()
    if (timeDiff !== 0) return timeDiff
    const impactOrder = { High: 0, Medium: 1, Low: 2 }
    return impactOrder[a.impact] - impactOrder[b.impact]
  })

  return allEvents
}

function mapImpact(raw: string): "High" | "Medium" | "Low" {
  const val = (raw || "").toLowerCase()
  if (val === "high") return "High"
  if (val === "medium") return "Medium"
  return "Low"
}

export async function GET() {
  try {
    const events = await fetchForexFactoryCalendar()

    if (events.length === 0) {
      return NextResponse.json({ events: getDummyEvents(), source: "demo" })
    }

    return NextResponse.json({ events, source: "forexfactory" })
  } catch (error: any) {
    console.error("Economic Calendar route error:", error)
    return NextResponse.json(
      { events: getDummyEvents(), source: "demo", error: error.message },
      { status: 200 }
    )
  }
}

// Data dummy fallback — mencakup semua 4 mata uang relevan
function getDummyEvents(): EconomicEvent[] {
  const now = new Date()
  const today = now.toISOString().split("T")[0]
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tmr = tomorrow.toISOString().split("T")[0]
  const dayAfter = new Date(now)
  dayAfter.setDate(dayAfter.getDate() + 2)
  const da = dayAfter.toISOString().split("T")[0]

  return [
    // USD Events
    {
      title: "Non-Farm Payrolls (NFP)",
      country: "USD",
      date: `${today}T12:30:00.000Z`,
      impact: "High",
      forecast: "180K",
      previous: "175K",
      actual: "",
      unit: "",
    },
    {
      title: "FOMC Meeting Minutes",
      country: "USD",
      date: `${today}T18:00:00.000Z`,
      impact: "High",
      forecast: "",
      previous: "",
      actual: "",
      unit: "",
    },
    // EUR Events
    {
      title: "ECB Interest Rate Decision",
      country: "EUR",
      date: `${today}T11:45:00.000Z`,
      impact: "High",
      forecast: "3.40%",
      previous: "3.65%",
      actual: "",
      unit: "",
    },
    {
      title: "ECB Press Conference",
      country: "EUR",
      date: `${today}T12:30:00.000Z`,
      impact: "High",
      forecast: "",
      previous: "",
      actual: "",
      unit: "",
    },
    // GBP Events
    {
      title: "Bank of England Rate Decision",
      country: "GBP",
      date: `${tmr}T12:00:00.000Z`,
      impact: "High",
      forecast: "4.75%",
      previous: "5.00%",
      actual: "",
      unit: "",
    },
    // JPY Events
    {
      title: "BOJ Policy Rate",
      country: "JPY",
      date: `${tmr}T03:00:00.000Z`,
      impact: "High",
      forecast: "0.25%",
      previous: "0.10%",
      actual: "",
      unit: "",
    },
    // More USD
    {
      title: "Core CPI (MoM)",
      country: "USD",
      date: `${tmr}T12:30:00.000Z`,
      impact: "High",
      forecast: "0.3%",
      previous: "0.3%",
      actual: "",
      unit: "",
    },
    {
      title: "Initial Jobless Claims",
      country: "USD",
      date: `${tmr}T12:30:00.000Z`,
      impact: "Medium",
      forecast: "215K",
      previous: "220K",
      actual: "",
      unit: "",
    },
    {
      title: "ISM Manufacturing PMI",
      country: "USD",
      date: `${da}T14:00:00.000Z`,
      impact: "Medium",
      forecast: "49.5",
      previous: "48.7",
      actual: "",
      unit: "",
    },
    // More GBP
    {
      title: "UK GDP (MoM)",
      country: "GBP",
      date: `${da}T06:00:00.000Z`,
      impact: "Medium",
      forecast: "0.1%",
      previous: "0.2%",
      actual: "",
      unit: "",
    },
    // More JPY
    {
      title: "Japan CPI (YoY)",
      country: "JPY",
      date: `${da}T23:30:00.000Z`,
      impact: "Medium",
      forecast: "2.5%",
      previous: "2.8%",
      actual: "",
      unit: "",
    },
  ]
}
