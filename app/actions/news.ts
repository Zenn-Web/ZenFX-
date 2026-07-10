"use server"

export async function getCryptoNews() {
  try {
    // Memanggil API Kalender Ekonomi (ForexFactory JSON public feed)
    const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
      next: { revalidate: 60 }
    })
    
    if (!response.ok) {
      throw new Error(`Gagal fetch API: ${response.statusText}`)
    }
    
    const result = await response.json()
    // Kembalikan array langsung dari result
    return { success: true, data: result || [] }
  } catch (error: any) {
    console.error("Server Action Error:", error)
    return { success: false, error: error.message || "Terjadi kesalahan di Server Action" }
  }
}
