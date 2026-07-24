"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"
import { useReducedMotion } from "motion/react"

type Size = {
  width: number | undefined
  height: number | undefined
}

function useWindowSize() {
  const [windowSize, setWindowSize] = useState<Size>({
    width: undefined,
    height: undefined,
  })
  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)

    handleResize()

    return () => window.removeEventListener("resize", handleResize)
  }, [])
  return windowSize
}

function ResponsiveConfetti() {
  const { width, height } = useWindowSize()
  return <Confetti width={width} height={height} />
}

export default function ReactConfetti() {
  const shouldReduceMotion = useReducedMotion() ?? true
  return shouldReduceMotion ? null : <ResponsiveConfetti />
}
