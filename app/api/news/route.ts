import { NextResponse } from "next/server"

export interface NewsItem {
  id: number
  headline: string
  summary: string
  source: string
  url: string
  image: string
  datetime: number   // Unix timestamp
  category: string
}

// Kata kunci untuk filter berita relevan XAUUSD/Gold
const GOLD_KEYWORDS = [
  "gold", "xauusd", "xau", "bullion",
  "fed", "fomc", "powell", "federal reserve",
  "inflation", "cpi", "ppi", "nfp", "payroll",
  "interest rate", "treasury", "dollar", "usd",
  "risk", "safe haven", "geopolit",
]

function isGoldRelevant(item: NewsItem): boolean {
  const text = `${item.headline} ${item.summary} ${item.category}`.toLowerCase()
  return GOLD_KEYWORDS.some((kw) => text.includes(kw))
}

export async function GET() {
  const apiKey = process.env.FINNHUB_API_KEY

  if (!apiKey || apiKey === "your_finnhub_api_key_here") {
    return NextResponse.json({ news: getDummyNews(), source: "demo" })
  }

  try {
    // Ambil dari dua kategori: forex + general
    const [forexRes, generalRes] = await Promise.allSettled([
      fetch(`https://finnhub.io/api/v1/news?category=forex&token=${apiKey}`, {
        next: { revalidate: 60 * 5 }, // Cache 5 menit
      }),
      fetch(`https://finnhub.io/api/v1/news?category=general&token=${apiKey}`, {
        next: { revalidate: 60 * 5 },
      }),
    ])

    const allNews: NewsItem[] = []

    for (const result of [forexRes, generalRes]) {
      if (result.status === "fulfilled" && result.value.ok) {
        const data: NewsItem[] = await result.value.json()
        allNews.push(...data)
      }
    }

    if (allNews.length === 0) {
      return NextResponse.json({ news: getDummyNews(), source: "demo" })
    }

    // Deduplicate berdasarkan ID
    const seen = new Set<number>()
    const unique = allNews.filter((item) => {
      if (seen.has(item.id)) return false
      seen.add(item.id)
      return true
    })

    // Filter hanya yang relevan untuk Gold/XAUUSD
    const relevant = unique.filter(isGoldRelevant)

    // Jika tidak ada yang relevan, ambil semua forex news
    const finalNews = relevant.length > 0
      ? relevant
      : unique.filter((i) => i.category === "forex")

    // Urutkan terbaru dulu
    finalNews.sort((a, b) => b.datetime - a.datetime)

    return NextResponse.json({
      news: finalNews.slice(0, 30),
      source: "finnhub",
      total: finalNews.length,
    })
  } catch (error: any) {
    console.error("News API error:", error)
    return NextResponse.json(
      { news: getDummyNews(), source: "demo", error: error.message },
      { status: 200 }
    )
  }
}

function getDummyNews(): NewsItem[] {
  const now = Math.floor(Date.now() / 1000)
  return [
    {
      id: 1,
      headline: "Gold rises on Fed uncertainty and safe-haven demand",
      summary: "Gold prices climbed as investors sought safe-haven assets amid uncertainty about the Federal Reserve's rate path.",
      source: "Reuters",
      url: "#",
      image: "",
      datetime: now - 3600,
      category: "forex",
    },
    {
      id: 2,
      headline: "FOMC minutes signal caution on future rate cuts",
      summary: "Federal Reserve meeting minutes showed policymakers remain cautious, boosting gold as a hedge against prolonged high rates.",
      source: "Bloomberg",
      url: "#",
      image: "",
      datetime: now - 7200,
      category: "forex",
    },
    {
      id: 3,
      headline: "US CPI data expected to show cooling inflation this week",
      summary: "Analysts forecast US consumer price index to ease, which could pressure the dollar and support gold prices.",
      source: "Forexlive",
      url: "#",
      image: "",
      datetime: now - 10800,
      category: "forex",
    },
  ]
}
