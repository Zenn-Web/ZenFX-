/**
 * E2E TESTS — Playwright
 * Tests the complete user flow through the slide deck.
 * Fixed: strict-mode selector violations, slide transition timing, market slide load wait.
 */

import { test, expect, Page } from "@playwright/test"

const BASE_URL = "http://localhost:3000"

async function waitForSlide(page: Page) {
  await page.waitForTimeout(550) // animation is 420ms + buffer
}

// Navigate to a specific slide and wait for transition
async function goToSlide(page: Page, key: string) {
  await page.keyboard.press(key)
  await waitForSlide(page)
}

test.describe("ZenFX Private Slide-Deck Suite", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL)
    await page.evaluate(() => localStorage.clear())
    await page.reload()
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(300)
  })

  // ── COVER SLIDE ──────────────────────────────────────────────────
  test.describe("Slide 0 — Cover", () => {
    test("should display welcome message for Zen The Trader", async ({ page }) => {
      await expect(page.getByText("Welcome,").first()).toBeVisible({ timeout: 3000 })
      await expect(page.getByText("Zen The Trader").first()).toBeVisible({ timeout: 3000 })
    })

    test("should show personal trading suite subtitle", async ({ page }) => {
      await expect(
        page.getByText(/Private Forex & Gold Suite|Private Trading Suite/i).first()
      ).toBeVisible({ timeout: 3000 })
    })

    test("should show Enter button", async ({ page }) => {
      const enterBtn = page.getByRole("button", { name: /masuk ke dashboard/i })
      await expect(enterBtn).toBeVisible({ timeout: 3000 })
    })

    test("should navigate to Market slide when Enter button clicked", async ({ page }) => {
      // Wait for CTA animation to complete
      await page.waitForTimeout(1800)
      const enterBtn = page.getByRole("button", { name: /masuk ke dashboard/i })
      await enterBtn.click()
      await waitForSlide(page)
      // Bottom nav appears after entering the deck
      await expect(page.getByRole("navigation")).toBeVisible({ timeout: 3000 })
    })

    test("should navigate to Market slide on Arrow Right key", async ({ page }) => {
      await page.keyboard.press("ArrowRight")
      await waitForSlide(page)
      await expect(page.getByRole("navigation")).toBeVisible({ timeout: 3000 })
    })
  })

  // ── BOTTOM NAVIGATION ─────────────────────────────────────────────
  test.describe("Bottom Navigation Dock", () => {
    test.beforeEach(async ({ page }) => {
      await page.keyboard.press("ArrowRight")
      await waitForSlide(page)
    })

    test("should show all navigation items in the dock", async ({ page }) => {
      const nav = page.getByRole("navigation")
      await expect(nav).toBeVisible({ timeout: 3000 })
      // Check labels inside nav
      await expect(nav.getByText("Market")).toBeVisible()
      await expect(nav.getByText("AI Chat")).toBeVisible()
    })

    test("should navigate to AI Chat slide on nav click", async ({ page }) => {
      // Use title attribute which is unique per button
      await page.getByTitle(/AI Chat \(2\)/i).click()
      await waitForSlide(page)
      // The AI chatbot header paragraph (exact)
      await expect(page.getByText("ZenFX AI", { exact: true })).toBeVisible({ timeout: 3000 })
    })

  })

  // ── KEYBOARD NAVIGATION ──────────────────────────────────────────
  test.describe("Keyboard Navigation", () => {
    test.beforeEach(async ({ page }) => {
      await page.keyboard.press("ArrowRight")
      await waitForSlide(page)
    })

    test("press '2' navigates to AI Chat slide", async ({ page }) => {
      await goToSlide(page, "2")
      await expect(page.getByText("ZenFX AI", { exact: true })).toBeVisible({ timeout: 3000 })
    })


    test("Arrow Left returns to previous slide", async ({ page }) => {
      await goToSlide(page, "2") // → AI Chat
      await page.keyboard.press("ArrowLeft") // → Market
      await waitForSlide(page)
      // Check for the XAU / USD symbol which is always visible in the market slide header
      await expect(page.getByText("XAU / USD").first()).toBeVisible({ timeout: 3000 })
    })
  })

  // ── MARKET SLIDE ─────────────────────────────────────────────────
  test.describe("Slide 1 — Market Terminal", () => {
    test.beforeEach(async ({ page }) => {
      await goToSlide(page, "1")
    })

    test("should display XAU/USD symbol in slide header", async ({ page }) => {
      // The market slide header always shows XAU / USD
      await expect(page.getByText("XAU / USD").first()).toBeVisible({ timeout: 5000 })
    })

    test("should show market status indicator (Open or Closed)", async ({ page }) => {
      // The market status shows either "Open" or "Closed" in a badge
      const open = page.getByText("Open", { exact: true })
      const closed = page.getByText("Closed", { exact: true })
      // At least one must be visible
      const hasOpen = await open.isVisible().catch(() => false)
      const hasClosed = await closed.isVisible().catch(() => false)
      expect(hasOpen || hasClosed).toBe(true)
    })

    test("should show Fundamental Panel toggle button", async ({ page }) => {
      await expect(page.getByText("Fundamental Panel").first()).toBeVisible({ timeout: 3000 })
    })
  })

  // ── AI CHAT SLIDE ─────────────────────────────────────────────────
  test.describe("Slide 2 — AI Chat", () => {
    test.beforeEach(async ({ page }) => {
      await goToSlide(page, "2")
    })

    test("should show AI chatbot header with exact text", async ({ page }) => {
      // The header <p> tag has exact text "ZenFX AI"
      await expect(page.getByText("ZenFX AI", { exact: true })).toBeVisible({ timeout: 3000 })
    })

    test("should show ICT Market Analyst subtitle", async ({ page }) => {
      await expect(page.getByText(/ICT Market Analyst/i)).toBeVisible({ timeout: 3000 })
    })

    test("should show welcome message in chat", async ({ page }) => {
      await expect(page.getByText(/Halo Zen/i)).toBeVisible({ timeout: 3000 })
    })

    test("should show quick prompts sidebar", async ({ page }) => {
      await expect(page.getByText("Quick Ask")).toBeVisible({ timeout: 3000 })
    })

    test("chat input should be functional", async ({ page }) => {
      const textarea = page.getByPlaceholder(/Tanya tentang market/i)
      await expect(textarea).toBeVisible({ timeout: 3000 })
      await textarea.fill("Test message")
      await expect(textarea).toHaveValue("Test message")
    })
  })


  // ── slide load behavior ───────────────────────────────────────────
  test.describe("Slide Load Behavior", () => {
    test("should always open to Cover slide on reload even if previously on another slide", async ({ page }) => {
      await page.keyboard.press("ArrowRight") // enter deck
      await waitForSlide(page)
      await goToSlide(page, "2") // → AI Chat

      // Verify we're on AI Chat before reload
      await expect(page.getByText("ZenFX AI", { exact: true })).toBeVisible({ timeout: 3000 })

      await page.reload()
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(500)

      // It should open to the Cover slide (Welcome Zen The Trader)
      await expect(page.getByText("Welcome,").first()).toBeVisible({ timeout: 5000 })
      await expect(page.getByText("Zen The Trader").first()).toBeVisible({ timeout: 5000 })
    })
  })
})
