"use client"

import { useTheme } from "next-themes"
import ThemeToggle from "@/components/ThemeToggle"

export default function ToggleDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDarkTheme = resolvedTheme === "dark"

  return (
    <ThemeToggle
      isDarkTheme={isDarkTheme}
      onToggle={() => setTheme(isDarkTheme ? "light" : "dark")}
    />
  )
}
