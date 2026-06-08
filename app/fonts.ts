import { Geist_Mono } from "next/font/google"
import localFont from "next/font/local"

// ─── Police principale ────────────────────────────────────────────────────────
// Pour changer la police de toute l'app : modifier uniquement ce bloc.
// Remplacer localFont par un import Google Font si besoin :
//   import { Inter } from "next/font/google"
//   export const fontPrimary = Inter({ variable: "--font-primary", subsets: ["latin"] })

export const fontPrimary = localFont({
  src: "./fonts/cal-sans.woff2",
  variable: "--font-primary",
  weight: "400",
})

// ─── Police monospace (tokens céramique, compteurs) ──────────────────────────
export const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const fontClassNames = `${fontPrimary.variable} ${fontMono.variable}`
