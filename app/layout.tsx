import type { Metadata } from "next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

/* ── Latest indicator snapshot (update when new data releases) ── */
const LATEST_SNAPSHOT = [
  { name: "CPI",        actual: "2.4 %",   forecast: "2.3 %" },
  { name: "Core CPI",   actual: "2.2 %",   forecast: "2.1 %" },
  { name: "PCE",        actual: "2.7 %",   forecast: "2.6 %" },
  { name: "NFP",        actual: "255 k",   forecast: "240 k" },
  { name: "FOMC Rate",  actual: "5.25 %",  forecast: "5.25 %" },
]

const snapshotDescription = LATEST_SNAPSHOT.map(
  (i) => `${i.name} ${i.actual}`
).join(" · ")

export const metadata: Metadata = {
  title: "ZenFX — Personal Trading Suite",
  description: `Private trading suite untuk fundamental trader. Data terbaru: ${snapshotDescription}. Analisis XAUUSD, Forex News, Economic Calendar.`,
  keywords: [
    "ZenFX", "XAUUSD", "gold trading", "forex news", "fundamental analysis",
    "economic calendar", "CPI", "NFP", "PCE", "FOMC", "interest rate",
    "market research", "trading suite",
  ].join(", "),
  authors: [{ name: "Zen The Trader" }],
  openGraph: {
    title: "ZenFX — Personal Trading Suite",
    description: `Data terbaru: ${snapshotDescription}`,
    type: "website",
    locale: "id_ID",
  },
  other: {
    /* schema.org structured data for economic data releases */
    "application/ld+json": JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "ZenFX Economic Indicators",
      description: "Kumpulan data rilis ekonomi makro utama: CPI, PPI, PCE, NFP, dan indikator lain yang digunakan oleh fundamental forex trader.",
      url: "https://zenfx.trade",
      creator: {
        "@type": "Person",
        name: "Zen The Trader",
      },
      hasPart: LATEST_SNAPSHOT.map((i) => ({
        "@type": "Observation",
        name: i.name,
        measuredValue: i.actual,
      })),
    }),
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="h-full antialiased font-sans dark">
      <head>
        <meta name="description" content={`ZenFX Economic Dashboard — ${snapshotDescription}`} />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="theme-color" content="#0A0D12" />
      </head>
      <body className="h-full bg-[#0A0D12] overflow-hidden">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
