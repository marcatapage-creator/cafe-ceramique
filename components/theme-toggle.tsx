'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { SunLight, HalfMoon, Computer } from 'iconoir-react'

const THEMES = ['light', 'dark', 'system'] as const
type Theme = typeof THEMES[number]

const ICONS: Record<Theme, React.ElementType> = {
  light:  SunLight,
  dark:   HalfMoon,
  system: Computer,
}

const LABELS: Record<Theme, string> = {
  light:  'Clair',
  dark:   'Sombre',
  system: 'Système',
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect -- pattern standard next-themes pour éviter le mismatch d'hydratation
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="size-7" />

  const current = (THEMES.includes(theme as Theme) ? theme : 'system') as Theme
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length]
  const Icon = ICONS[current]

  return (
    <button
      onClick={() => setTheme(next)}
      title={`Thème : ${LABELS[current]} — cliquer pour ${LABELS[next]}`}
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:text-gray-500 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon className="size-4" />
    </button>
  )
}
