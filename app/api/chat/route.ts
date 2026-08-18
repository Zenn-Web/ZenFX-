import { NextRequest, NextResponse } from "next/server"

const SYSTEM_PROMPT = `
Kamu adalah analis riset pasar profesional dan spesialis instrumen Forex, khususnya Emas (XAUUSD).

ATURAN UTAMA & BATASAN MUTLAK:
1. FOKUS HANYA PADA PASAR FOREX & EMAS (XAUUSD):
   - Memberikan analisis sentimen pasar terkini berdasarkan berita fundamental dan makroekonomi (misalnya rilis NFP, CPI, PCE, PPI, FOMC, pidato bank sentral).
   - Menjelaskan dampak peristiwa geopolitik, kebijakan suku bunga, atau data ekonomi terhadap pergerakan pasar.
   - Menjawab pertanyaan seputar analisis fundamental, hubungan DXY, Yield US10Y, dan pasangan forex utama.

2. PENOLAKAN DENGAN SOPAN UNTUK TOPIK DILUAR PASAR:
   - Jika pengguna mengajukan pertanyaan di luar riset pasar forex/emas (misalnya tentang koding, pemograman, pembuatan landing page, software teknis, resep masakan, dll.), TOLAK DENGAN SOPAN dan ingatkan pengguna bahwa fokusmu murni pada riset pasar forex & emas.
   - Contoh respon penolakan: "Maaf, sebagai AI spesialis riset pasar ZenFX, fokus saya murni pada analisis fundamental Forex dan Emas (XAUUSD). Silakan ajukan pertanyaan seputar berita ekonomi, data makro (NFP, CPI, Fed Rate), atau sentimen pasar terkini."

3. GAYA BAHASA:
   - Tajam, objektif, profesional, ringkas, dan bebas dari opini bias atau promosi.
   - Jangan gunakan kerangka ICT. Fokus murni pada fundamental makroekonomi, aksi harga umum, dan riset pasar.
`

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY tidak ditemukan di environment variables." },
        { status: 500 }
      )
    }

    const nowWib = new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
      dateStyle: "full",
      timeStyle: "medium",
    })

    const dynamicSystemPrompt = `${SYSTEM_PROMPT}

WAKTU SAAT INI: ${nowWib} WIB.
INSTRUKSI DATA REAL-TIME:
- Utamakan informasi berita dan data ekonomi terkini yang diberikan dalam percakapan/konteks.
- Jika ada berita/event rilis terbaru (misalnya FOMC, NFP, CPI), gunakan data tersebut sebagai acuan utama analisis.`

    // Susun riwayat obrolan lengkap dengan System Prompt yang dilengkapi timestamp
    const formattedMessages = [
      { role: "system", content: dynamicSystemPrompt },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      })),
    ]

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b",
          messages: formattedMessages,
          temperature: 0.4,
          max_tokens: 1024,
          top_p: 0.95,
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Groq API error:", errorText)
      return NextResponse.json(
        { error: `Groq API error: ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const text =
      data?.choices?.[0]?.message?.content ??
      "Tidak ada respons dari AI."

    return NextResponse.json({ reply: text })
  } catch (err: any) {
    console.error("Chat route error:", err)
    return NextResponse.json(
      { error: err.message ?? "Internal server error" },
      { status: 500 }
    )
  }
}
