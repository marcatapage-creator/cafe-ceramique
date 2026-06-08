import { Barlow, Geist_Mono } from "next/font/google"

// ─── Police principale ────────────────────────────────────────────────────────
// Pour changer la police de toute l'app : modifier uniquement ce bloc.

export const fontPrimary = Barlow({
  variable: "--font-primary",
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
})

// ─── Police monospace (tokens céramique, compteurs) ──────────────────────────
export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const fontClassNames = `${fontPrimary.variable} ${fontMono.variable}`
