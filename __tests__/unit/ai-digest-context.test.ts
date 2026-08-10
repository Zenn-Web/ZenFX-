import { formatEventContext } from "@/components/slides/news-research-slide"

describe("AI Digest Helper - formatEventContext", () => {
  it("preserves 0 and 0.0% forecast values instead of converting to N/A", () => {
    const mockEvent = {
      country: "USD",
      title: "Core CPI m/m",
      forecast: 0,
      previous: "0.1%",
      actual: "0.0%",
      impact: "High",
    }

    const formatted = formatEventContext(mockEvent)
    expect(formatted).toContain("Forecast: 0")
    expect(formatted).not.toContain("Forecast: N/A")
  })

  it("handles string zero forecast '0.0%' correctly", () => {
    const mockEvent = {
      country: "USD",
      title: "Non-Farm Payrolls",
      forecast: "0.0%",
      previous: "150k",
      actual: "175k",
      impact: "High",
    }

    const formatted = formatEventContext(mockEvent)
    expect(formatted).toContain("Forecast: 0.0%")
    expect(formatted).not.toContain("Forecast: N/A")
  })

  it("returns N/A when forecast is null or undefined", () => {
    const mockEvent = {
      country: "USD",
      title: "FOMC Member Speaks",
      forecast: null,
      previous: undefined,
      actual: null,
      impact: "High",
    }

    const formatted = formatEventContext(mockEvent)
    expect(formatted).toContain("Forecast: N/A")
  })
})
