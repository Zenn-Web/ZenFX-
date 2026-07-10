"use server"

export async function getChartData(symbol: string = "GC=F", interval: string = "1d", range: string = "100d") {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`

    const response = await fetch(url, {
      headers: {
        // Header agar Yahoo Finance tidak memblokir request dari server
        'User-Agent': 'Mozilla/5.0 (compatible; NextJS-App/1.0)',
      },
      next: { revalidate: 60 } // Cache 60 detik
    })

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.statusText}`)
    }

    const data = await response.json()
    const result = data.chart?.result?.[0]

    if (!result) {
      throw new Error("Tidak ada data chart dari Yahoo Finance")
    }

    const timestamps: number[] = result.timestamp
    const quote = result.indicators.quote[0]

    // Format data agar siap dipakai oleh Lightweight Charts v5
    const formattedData = timestamps
      .map((time: number, i: number) => ({
        time,
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
      }))
      // Filter data yang tidak lengkap (kadang ada nilai null dari Yahoo)
      .filter((d) => d.open && d.high && d.low && d.close)

    return { success: true, data: formattedData }
  } catch (error: any) {
    console.error("getChartData error:", error)
    return { success: false, error: error.message, data: [] }
  }
}
