import type { Metadata } from "next"
import "./globals.css"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  title: "ZenFX — Personal Trading Suite",
  description: "Private trading suite milik Zen The Trader. Analisis pasar XAUUSD, AI Market Analyst berbasis Market Research, Fundamental Analysis, dan berita Forex.",
  keywords: "XAUUSD, gold trading, market research, forex news, fundamental analysis, ZenFX",
  authors: [{ name: "Zen The Trader" }],
  openGraph: {
    title: "ZenFX — Personal Trading Suite",
    description: "Private trading suite untuk Zen The Trader",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id" className="h-full antialiased font-sans dark">
      <body className="h-full bg-[#0A0D12] overflow-hidden">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  )
}
