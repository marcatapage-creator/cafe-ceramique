"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CheckCircle, InfoCircle, WarningTriangle, XmarkCircle, RefreshDouble } from "iconoir-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CheckCircle className="size-4" />
        ),
        info: (
          <InfoCircle className="size-4" />
        ),
        warning: (
          <WarningTriangle className="size-4" />
        ),
        error: (
          <XmarkCircle className="size-4" />
        ),
        loading: (
          <RefreshDouble className="size-4 animate-spin" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
