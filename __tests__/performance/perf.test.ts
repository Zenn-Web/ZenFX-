/**
 * PERFORMANCE TESTS — Response time, throughput, and render efficiency (Groq Migration)
 * Tests that core utilities and API handlers respond within acceptable thresholds.
 */

import { isForexMarketOpen, getActiveSessions, formatCountdown } from "@/lib/marketHours"

import { POST } from "@/app/api/chat/route"
import { NextRequest } from "next/server"

const mockFetch = jest.fn()
global.fetch = mockFetch

beforeEach(() => {
  jest.resetAllMocks()
  process.env.GROQ_API_KEY = "perf-test-key"
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => ({
      choices: [{ message: { content: "Response" } }],
    }),
  })
})

describe("Performance Tests", () => {

  describe("lib/marketHours — Computation Speed", () => {
    const ITERATIONS = 10_000

    it(`isForexMarketOpen completes ${ITERATIONS} calls in < 50ms`, () => {
      const now = new Date()
      const start = performance.now()
      for (let i = 0; i < ITERATIONS; i++) {
        isForexMarketOpen(now)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(50) // 50ms for 10k calls is very generous
    })

    it(`getActiveSessions completes ${ITERATIONS} calls in < 100ms`, () => {
      const now = new Date()
      const start = performance.now()
      for (let i = 0; i < ITERATIONS; i++) {
        getActiveSessions(now)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(100)
    })

    it(`formatCountdown completes ${ITERATIONS} calls in < 50ms`, () => {
      const now = new Date()
      const target = new Date(now.getTime() + 3600_000)
      const start = performance.now()
      for (let i = 0; i < ITERATIONS; i++) {
        formatCountdown(target, now)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(50)
    })
  })



  describe("API Route — Response Time with Mock", () => {
    // Note: real network latency removed — only measuring routing overhead
    const RESPONSE_DELAY_MS = 50

    it("chat route overhead should be < 100ms (excluding network)", async () => {
      // Simulate 50ms network delay
      mockFetch.mockImplementationOnce(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  ok: true,
                  json: async () => ({
                    choices: [{ message: { content: "Response" } }],
                  }),
                }),
              RESPONSE_DELAY_MS
            )
          )
      )

      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: "test" }] }),
      })

      const start = performance.now()
      await POST(req)
      const elapsed = performance.now() - start

      // Route overhead (beyond the simulated 50ms delay) should be < 100ms
      expect(elapsed).toBeLessThan(RESPONSE_DELAY_MS + 100)
    })

    it("concurrent requests should all resolve independently", async () => {
      const makeReq = () =>
        new NextRequest("http://localhost:3000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [{ role: "user", content: "concurrent test" }] }),
        })

      // Simulate 5 concurrent requests
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          choices: [{ message: { content: "Response" } }],
        }),
      })

      const results = await Promise.all([
        POST(makeReq()),
        POST(makeReq()),
        POST(makeReq()),
        POST(makeReq()),
        POST(makeReq()),
      ])

      results.forEach((res) => {
        expect(res.status).toBe(200)
      })
    })
  })

  describe("Calculator — Computation Throughput", () => {
    function calculatePosition(balance: number, riskPct: number, slPips: number, pipValue: number) {
      const riskAmount = (balance * riskPct) / 100
      const lotSize = slPips > 0 ? riskAmount / (slPips * pipValue) : 0
      return { riskAmount, lotSize, miniLot: lotSize * 10, microLot: lotSize * 100 }
    }

    it("should compute 100,000 position calculations in < 200ms", () => {
      const start = performance.now()
      for (let i = 1; i <= 100_000; i++) {
        calculatePosition(10000, 1, i % 100 + 1, 10)
      }
      const elapsed = performance.now() - start
      expect(elapsed).toBeLessThan(200)
    })
  })
})
