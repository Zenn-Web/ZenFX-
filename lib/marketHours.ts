/**
 * Utility: Market Hours for Forex (XAUUSD / Gold)
 *
 * Forex pasar buka:
 *   - Senin 00:00 UTC → Jumat 21:00 UTC (NYSE close)
 *   - Sabtu & Minggu: DITUTUP
 *
 * Catatan: Gold/XAUUSD mengikuti sesi forex global
 */

export type MarketStatus = "open" | "closed"

/**
 * Cek apakah pasar forex sedang buka berdasarkan waktu UTC saat ini
 */
export function isForexMarketOpen(now: Date = new Date()): boolean {
  const day = now.getUTCDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getUTCHours()
  const minute = now.getUTCMinutes()
  const timeInMinutes = hour * 60 + minute

  // Sabtu = tutup seharian
  if (day === 6) return false

  // Minggu: buka mulai 22:00 UTC (sesi Sydney/Tokyo buka)
  if (day === 0) {
    return timeInMinutes >= 22 * 60
  }

  // Jumat: tutup setelah 21:00 UTC (NYSE close)
  if (day === 5) {
    return timeInMinutes < 21 * 60
  }

  // Senin - Kamis: buka 24 jam
  return true
}

/**
 * Dapatkan label status pasar
 */
export function getMarketStatus(now: Date = new Date()): MarketStatus {
  return isForexMarketOpen(now) ? "open" : "closed"
}

/**
 * Format sesi pasar yang sedang aktif berdasarkan jam UTC
 */
export function getActiveSessions(now: Date = new Date()): string[] {
  const hour = now.getUTCHours()
  const sessions: string[] = []

  if (!isForexMarketOpen(now)) return []

  // Sydney: 22:00 - 07:00 UTC
  if (hour >= 22 || hour < 7) sessions.push("Sydney")

  // Tokyo: 00:00 - 09:00 UTC
  if (hour < 9 || hour >= 0 && hour < 9) {
    if (!sessions.includes("Tokyo")) sessions.push("Tokyo")
  }

  // London: 08:00 - 17:00 UTC
  if (hour >= 8 && hour < 17) sessions.push("London")

  // New York: 13:00 - 21:00 UTC
  if (hour >= 13 && hour < 21) sessions.push("New York")

  return sessions
}

/**
 * Hitung kapan pasar buka berikutnya (dalam ms dari sekarang)
 */
export function getNextMarketOpen(now: Date = new Date()): Date {
  const next = new Date(now)

  const day = next.getUTCDay()

  // Jika Sabtu, pasar buka Minggu 22:00 UTC
  if (day === 6) {
    next.setUTCDate(next.getUTCDate() + 1)
    next.setUTCHours(22, 0, 0, 0)
    return next
  }

  // Jika Jumat setelah 21:00 atau awal Sabtu sebelum Minggu 22:00
  if (day === 5) {
    const hour = next.getUTCHours()
    if (hour >= 21) {
      next.setUTCDate(next.getUTCDate() + 2) // Minggu
      next.setUTCHours(22, 0, 0, 0)
      return next
    }
  }

  return next // sudah buka
}

/**
 * Format waktu countdown hingga pasar buka
 */
export function formatCountdown(targetDate: Date, now: Date = new Date()): string {
  const diffMs = targetDate.getTime() - now.getTime()
  if (diffMs <= 0) return "Segera"

  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  if (hours > 0) return `${hours}j ${minutes}m`
  return `${minutes}m`
}
