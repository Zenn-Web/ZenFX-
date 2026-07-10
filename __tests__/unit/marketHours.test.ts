/**
 * UNIT TESTS — lib/marketHours.ts
 * Tests all market session logic with precise UTC timestamps.
 */

import {
  isForexMarketOpen,
  getMarketStatus,
  getActiveSessions,
  getNextMarketOpen,
  formatCountdown,
} from "@/lib/marketHours"

// Helper: create UTC date with specific day/hour
function utcDate(dayOfWeek: number, hour: number, minute = 0): Date {
  // Find a real date matching the given UTC day of week
  const base = new Date("2025-01-06T00:00:00Z") // Monday Jan 6 2025
  const diff = ((dayOfWeek - 1 + 7) % 7) // offset from Monday
  const d = new Date(base)
  d.setUTCDate(base.getUTCDate() + diff)
  d.setUTCHours(hour, minute, 0, 0)
  return d
}

const MON = 1, TUE = 2, WED = 3, THU = 4, FRI = 5, SAT = 6, SUN = 0

describe("isForexMarketOpen", () => {
  it("is OPEN on Monday 00:00 UTC", () => {
    expect(isForexMarketOpen(utcDate(MON, 0))).toBe(true)
  })

  it("is OPEN on Tuesday 12:00 UTC", () => {
    expect(isForexMarketOpen(utcDate(TUE, 12))).toBe(true)
  })

  it("is OPEN on Wednesday 23:59 UTC", () => {
    expect(isForexMarketOpen(utcDate(WED, 23, 59))).toBe(true)
  })

  it("is OPEN on Friday 20:59 UTC (just before close)", () => {
    expect(isForexMarketOpen(utcDate(FRI, 20, 59))).toBe(true)
  })

  it("is CLOSED on Friday 21:00 UTC (NYSE close)", () => {
    expect(isForexMarketOpen(utcDate(FRI, 21, 0))).toBe(false)
  })

  it("is CLOSED all day Saturday", () => {
    expect(isForexMarketOpen(utcDate(SAT, 0))).toBe(false)
    expect(isForexMarketOpen(utcDate(SAT, 12))).toBe(false)
    expect(isForexMarketOpen(utcDate(SAT, 23, 59))).toBe(false)
  })

  it("is CLOSED on Sunday before 22:00 UTC", () => {
    expect(isForexMarketOpen(utcDate(SUN, 0))).toBe(false)
    expect(isForexMarketOpen(utcDate(SUN, 21, 59))).toBe(false)
  })

  it("is OPEN on Sunday 22:00 UTC (Sydney open)", () => {
    expect(isForexMarketOpen(utcDate(SUN, 22))).toBe(true)
  })
})

describe("getMarketStatus", () => {
  it("returns 'open' when market is open", () => {
    expect(getMarketStatus(utcDate(MON, 10))).toBe("open")
  })

  it("returns 'closed' when market is closed", () => {
    expect(getMarketStatus(utcDate(SAT, 10))).toBe("closed")
  })
})

describe("getActiveSessions", () => {
  it("returns empty array when market is closed", () => {
    expect(getActiveSessions(utcDate(SAT, 12))).toEqual([])
  })

  it("includes London session at 10:00 UTC on Monday", () => {
    const sessions = getActiveSessions(utcDate(MON, 10))
    expect(sessions).toContain("London")
  })

  it("includes New York session at 14:00 UTC on Monday", () => {
    const sessions = getActiveSessions(utcDate(MON, 14))
    expect(sessions).toContain("New York")
  })

  it("includes London-NY overlap at 14:00 UTC", () => {
    const sessions = getActiveSessions(utcDate(MON, 14))
    expect(sessions).toContain("London")
    expect(sessions).toContain("New York")
  })

  it("includes Sydney session at 23:00 UTC on Monday", () => {
    const sessions = getActiveSessions(utcDate(MON, 23))
    expect(sessions).toContain("Sydney")
  })

  it("includes Tokyo session at 02:00 UTC on Tuesday", () => {
    const sessions = getActiveSessions(utcDate(TUE, 2))
    expect(sessions).toContain("Tokyo")
  })
})

describe("formatCountdown", () => {
  const now = new Date("2025-01-11T21:30:00Z") // Saturday 21:30 UTC

  it("returns 'Segera' when target is in the past", () => {
    const past = new Date(now.getTime() - 1000)
    expect(formatCountdown(past, now)).toBe("Segera")
  })

  it("formats hours and minutes correctly", () => {
    const target = new Date(now.getTime() + (2 * 60 + 30) * 60 * 1000) // 2h 30m later
    const result = formatCountdown(target, now)
    expect(result).toBe("2j 30m")
  })

  it("formats minutes-only when less than 1 hour", () => {
    const target = new Date(now.getTime() + 45 * 60 * 1000) // 45 minutes
    expect(formatCountdown(target, now)).toBe("45m")
  })

  it("returns '0m' when diff is 0", () => {
    expect(formatCountdown(now, now)).toBe("Segera")
  })
})

describe("getNextMarketOpen", () => {
  it("returns Sunday 22:00 UTC when called on Saturday", () => {
    const saturday = utcDate(SAT, 10)
    const next = getNextMarketOpen(saturday)
    expect(next.getUTCDay()).toBe(SUN)
    expect(next.getUTCHours()).toBe(22)
  })

  it("returns Sunday 22:00 UTC when called on Friday after 21:00", () => {
    const fridayEvening = utcDate(FRI, 22)
    const next = getNextMarketOpen(fridayEvening)
    // Should be 2 days forward from Friday = Sunday
    expect(next.getUTCDay()).toBe(SUN)
    expect(next.getUTCHours()).toBe(22)
  })
})
