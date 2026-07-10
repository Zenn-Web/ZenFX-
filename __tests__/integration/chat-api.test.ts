/**
 * INTEGRATION TESTS — app/api/chat/route.ts (Groq Migration)
 * Tests the AI chat API route handler with mocked fetch calls to Groq API.
 */

import { POST } from "@/app/api/chat/route"
import { NextRequest } from "next/server"

// Mock fetch globally
const mockFetch = jest.fn()
global.fetch = mockFetch

// Mock environment variable
const originalEnv = process.env

beforeEach(() => {
  jest.resetAllMocks()
  process.env = { ...originalEnv, GROQ_API_KEY: "test-api-key-12345" }
})

afterEach(() => {
  process.env = originalEnv
})

function makeRequest(body: object): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
}

describe("POST /api/chat", () => {
  describe("Happy path", () => {
    it("returns AI reply on successful Groq response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: "Fair Value Gap adalah imbalance harga pada 3 candle berurutan.",
              },
            },
          ],
        }),
      })

      const req = makeRequest({
        messages: [{ role: "user", content: "Jelaskan FVG" }],
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.reply).toBe("Fair Value Gap adalah imbalance harga pada 3 candle berurutan.")
    })

    it("sends correct system prompt to Groq API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "OK" } }],
        }),
      })

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })

      await POST(req)

      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe("https://api.groq.com/openai/v1/chat/completions")
      expect(options.headers["Authorization"]).toBe("Bearer test-api-key-12345")

      const body = JSON.parse(options.body)
      expect(body.messages[0].role).toBe("system")
      expect(body.messages[0].content).toContain("analis riset pasar profesional")
      expect(body.messages[1].role).toBe("user")
      expect(body.messages[1].content).toBe("test")
    })

    it("maintains conversation history sequence for Groq API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "response" } }],
        }),
      })

      const req = makeRequest({
        messages: [
          { role: "user", content: "Apa itu OB?" },
          { role: "assistant", content: "Order Block adalah..." },
          { role: "user", content: "Dan FVG?" },
        ],
      })

      await POST(req)

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.messages[0].role).toBe("system")
      expect(body.messages[1].role).toBe("user")
      expect(body.messages[2].role).toBe("assistant")
      expect(body.messages[3].role).toBe("user")
    })

    it("includes required model and parameters in request body", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "OK" } }],
        }),
      })

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })

      await POST(req)

      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.model).toBe("llama-3.3-70b-versatile")
      expect(body.temperature).toBe(0.7)
      expect(body.max_tokens).toBe(1024)
    })
  })

  describe("Error handling", () => {
    it("returns 500 when GROQ_API_KEY is missing", async () => {
      delete process.env.GROQ_API_KEY

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toMatch(/GROQ_API_KEY/i)
    })

    it("returns error status when Groq API returns non-OK response", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        statusText: "Too Many Requests",
        text: async () => "rate limit exceeded",
      })

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })

      const res = await POST(req)
      expect(res.status).toBe(429)
    })

    it("returns fallback message when choices array is empty", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      })

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(200)
      expect(data.reply).toBe("Tidak ada respons dari AI.")
    })

    it("returns 500 on network failure", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network failure"))

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })

      const res = await POST(req)
      const data = await res.json()

      expect(res.status).toBe(500)
      expect(data.error).toContain("Network failure")
    })
  })
})
