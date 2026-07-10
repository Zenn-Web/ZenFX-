/**
 * API TESTS — /api/chat endpoint (Groq Migration)
 * Tests request validation, response schema, and content-type enforcement.
 */

import { POST } from "@/app/api/chat/route"
import { NextRequest } from "next/server"

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.resetAllMocks()
  process.env.GROQ_API_KEY = "api-test-key"

  // Default successful mock
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: "Test response dari AI" } }],
    }),
  })
})

function makeRequest(body: unknown, contentType = "application/json"): NextRequest {
  return new NextRequest("http://localhost:3000/api/chat", {
    method: "POST",
    headers: { "Content-Type": contentType },
    body: JSON.stringify(body),
  })
}

describe("API Contract Tests — /api/chat", () => {
  describe("Request schema", () => {
    it("accepts valid messages array", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "Hello" }],
      })
      const res = await POST(req)
      expect(res.status).toBe(200)
    })

    it("accepts multi-turn conversation", async () => {
      const req = makeRequest({
        messages: [
          { role: "user", content: "Apa itu FVG?" },
          { role: "assistant", content: "FVG adalah..." },
          { role: "user", content: "Berikan contohnya" },
        ],
      })
      const res = await POST(req)
      expect(res.status).toBe(200)
    })

    it("uses POST method only — GET should not be defined", async () => {
      const routeModule = await import("@/app/api/chat/route")
      expect(routeModule.POST).toBeDefined()
      expect((routeModule as any).GET).toBeUndefined()
    })
  })

  describe("Response schema", () => {
    it("response body has 'reply' string field on success", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      const res = await POST(req)
      const body = await res.json()

      expect(body).toHaveProperty("reply")
      expect(typeof body.reply).toBe("string")
      expect(body.reply.length).toBeGreaterThan(0)
    })

    it("response body has 'error' string field on failure", async () => {
      delete process.env.GROQ_API_KEY

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      const res = await POST(req)
      const body = await res.json()

      expect(body).toHaveProperty("error")
      expect(typeof body.error).toBe("string")
    })
  })

  describe("Security — API key protection", () => {
    it("does NOT expose API key in response body", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      const res = await POST(req)
      const body = await res.json()
      const bodyStr = JSON.stringify(body)

      expect(bodyStr).not.toContain("api-test-key")
      expect(bodyStr).not.toContain("GROQ_API_KEY")
    })

    it("API key is only sent in Authorization header, not in request body", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      await POST(req)

      const [url, options] = mockFetch.mock.calls[0]
      const bodyStr = options.body

      expect(options.headers["Authorization"]).toBe("Bearer api-test-key")
      expect(bodyStr).not.toContain("api-test-key") // NOT in body
    })

    it("does NOT expose FINNHUB_API_KEY or other env vars in response", async () => {
      process.env.FINNHUB_API_KEY = "secret-finnhub-key"

      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      const res = await POST(req)
      const body = await res.json()
      const bodyStr = JSON.stringify(body)

      expect(bodyStr).not.toContain("secret-finnhub-key")
    })
  })

  describe("Groq API target", () => {
    it("calls Groq Llama 3.3 model endpoint", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      await POST(req)

      const [url, options] = mockFetch.mock.calls[0]
      const body = JSON.parse(options.body)
      expect(url).toBe("https://api.groq.com/openai/v1/chat/completions")
      expect(body.model).toBe("llama-3.3-70b-versatile")
    })

    it("sets Content-Type: application/json in upstream request", async () => {
      const req = makeRequest({
        messages: [{ role: "user", content: "test" }],
      })
      await POST(req)

      const [, options] = mockFetch.mock.calls[0]
      expect(options.headers["Content-Type"]).toBe("application/json")
    })
  })
})
