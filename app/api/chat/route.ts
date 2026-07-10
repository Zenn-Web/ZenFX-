import { NextRequest, NextResponse } from "next/server"
const SYSTEM_PROMPT = `
Kamu adalah analis riset pasar profesional yang berfokus pada instrumen Forex, khususnya Gold (XAUUSD).
Fokus utamamu adalah:
- Memberikan analisis sentimen pasar terkini berdasarkan berita fundamental dan makroekonomi (misalnya rilis NFP, CPI, pidato bank sentral).
- Menjelaskan dampak peristiwa geopolitik atau data ekonomi terhadap pergerakan pasar.
- Selalu memberikan analisis yang objektif, ringkas, dan bebas dari opini bias.
Jangan gunakan kerangka ICT. Fokus murni pada fundamental, aksi harga umum, dan riset pasar.
`;

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

    // Build Groq-compatible conversation history (standard OpenAI format)
    const formattedMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role,
        content: m.content,
      }))
    ]

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile", // Model unggulan Groq yang setara GPT-4
          messages: formattedMessages,
          temperature: 0.7,
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

