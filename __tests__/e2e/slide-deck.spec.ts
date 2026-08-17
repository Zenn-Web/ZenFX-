import { test, expect, type Page } from "@playwright/test"

const waitForSlide = async (page: Page) => {
  await page.waitForTimeout(500)
}

test.describe("ZenFX Personal Slide-Deck Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.waitForLoadState("domcontentloaded")
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    await page.reload()
    await page.waitForLoadState("domcontentloaded")
    await page.waitForTimeout(400)
  })

  // ── COVER SLIDE ──────────────────────────────────────────────────
  test.describe("Slide 0 — Cover & Auth Terminal", () => {
    test("should display ZenFX title and Personal Forex & Gold Suite badge", async ({ page }) => {
      await expect(page.getByText("ZenFX").first()).toBeVisible({ timeout: 5000 })
      await expect(page.getByText(/Personal Forex & Gold Suite|Personal Forex/i).first()).toBeVisible({ timeout: 5000 })
    })

    test("should display login / sign in form with inputs and buttons", async ({ page }) => {
      await expect(page.getByPlaceholder("nama@email.com")).toBeVisible({ timeout: 5000 })
      await expect(page.getByPlaceholder("Password (minimal 6 karakter)")).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole("button", { name: /Enter ZenFX Suite/i })).toBeVisible({ timeout: 5000 })
    })

    test("should switch between Sign In and Sign Up tabs", async ({ page }) => {
      const signUpTab = page.getByRole("button", { name: /Daftar Akun/i })
      await expect(signUpTab).toBeVisible({ timeout: 5000 })
      await signUpTab.click()
      await expect(page.getByRole("button", { name: /Buat Akun Baru/i })).toBeVisible({ timeout: 3000 })
      
      const signInTab = page.getByRole("button", { name: /Masuk \(Sign In\)/i }).first()
      await signInTab.click()
      await expect(page.getByRole("button", { name: /Enter ZenFX Suite/i })).toBeVisible({ timeout: 3000 })
    })
  })

  // ── AUTHENTICATED DASHBOARD NAVIGATION ───────────────────────────
  test.describe("Authenticated Dashboard Flow", () => {
    test.beforeEach(async ({ page }) => {
      // Simulate authenticated session
      await page.evaluate(() => {
        localStorage.setItem("zenfx_authenticated", "true")
        localStorage.setItem("zenfx_user_email", "zen@trader.io")
        localStorage.setItem("zenfx_active_dashboard_tab", "market-overview")
      })
      await page.reload()
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(500)
    })

    test("should display top status bar and bottom navigation when authenticated", async ({ page }) => {
      const nav = page.getByRole("navigation")
      await expect(nav).toBeVisible({ timeout: 5000 })
      await expect(nav.getByText("Market Overview")).toBeVisible()
      await expect(nav.getByText("News Research")).toBeVisible()
      await expect(nav.getByText("News Element")).toBeVisible()
    })

    test("should display user email badge in top header", async ({ page }) => {
      await expect(page.getByText("zen@trader.io")).toBeVisible({ timeout: 5000 })
    })

    test("should navigate to News Research on tab click", async ({ page }) => {
      const nav = page.getByRole("navigation")
      const newsTab = nav.getByRole("button", { name: /News Research/i })
      await newsTab.click()
      await waitForSlide(page)
      await expect(page.getByText(/Economic News Research|Economic Calendar/i).first()).toBeVisible({ timeout: 5000 })
    })

    test("should navigate to News Element on tab click", async ({ page }) => {
      const nav = page.getByRole("navigation")
      const elementTab = nav.getByRole("button", { name: /News Element/i })
      await elementTab.click()
      await waitForSlide(page)
      await expect(page.getByText("News Element").first()).toBeVisible({ timeout: 5000 })
    })

    test("should support keyboard navigation across slides", async ({ page }) => {
      // Press '2' to go to News Research
      await page.keyboard.press("2")
      await waitForSlide(page)
      await expect(page.getByText(/Economic News Research|Economic Calendar/i).first()).toBeVisible({ timeout: 5000 })

      // Press '1' to return to Market Overview
      await page.keyboard.press("1")
      await waitForSlide(page)
      await expect(page.getByText("Market Overview & Live Terminal").first()).toBeVisible({ timeout: 5000 })
    })
  })

  // ── SLIDE 1: MARKET OVERVIEW ─────────────────────────────────────
  test.describe("Slide 1 — Market Overview & Terminal", () => {
    test.beforeEach(async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem("zenfx_authenticated", "true")
        localStorage.setItem("zenfx_user_email", "zen@trader.io")
        localStorage.setItem("zenfx_active_dashboard_tab", "market-overview")
      })
      await page.reload()
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(500)
    })

    test("should display asset pills (XAUUSD, DXY, US10Y, EURUSD)", async ({ page }) => {
      await expect(page.getByRole("button", { name: /XAUUSD/i })).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole("button", { name: /DXY/i })).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole("button", { name: /US10Y/i })).toBeVisible({ timeout: 5000 })
      await expect(page.getByRole("button", { name: /EURUSD/i })).toBeVisible({ timeout: 5000 })
    })

    test("should show Trading Sessions and Key Macro Snapshot cards", async ({ page }) => {
      await expect(page.getByText("Trading Sessions")).toBeVisible({ timeout: 5000 })
      await expect(page.getByText("Key Macro Snapshot")).toBeVisible({ timeout: 5000 })
      await expect(page.getByText("Macro Bias & Sentiment")).toBeVisible({ timeout: 5000 })
    })
  })

  // ── PERSISTENCE BEHAVIOR ─────────────────────────────────────────
  test.describe("Dashboard Tab Persistence", () => {
    test("should preserve active tab across browser reload", async ({ page }) => {
      await page.evaluate(() => {
        localStorage.setItem("zenfx_authenticated", "true")
        localStorage.setItem("zenfx_user_email", "zen@trader.io")
        localStorage.setItem("zenfx_active_dashboard_tab", "news-research")
      })
      await page.reload()
      await page.waitForLoadState("domcontentloaded")
      await page.waitForTimeout(500)

      // Active tab should remain News Research
      await expect(page.getByText(/Economic News Research|Economic Calendar/i).first()).toBeVisible({ timeout: 5000 })
    })
  })
})
