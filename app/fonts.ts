import { Asta_Sans, Geist_Mono } from "next/font/google"

// ─── Police principale ────────────────────────────────────────────────────────
// Pour changer la police de toute l'app : modifier uniquement ce bloc.

export const fontPrimary = Asta_Sans({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
})

// ─── Police monospace (tokens céramique, compteurs) ──────────────────────────
export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const fontClassNames = `${fontPrimary.variable} ${fontMono.variable}`
