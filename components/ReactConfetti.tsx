"use client"

import { useEffect, useState } from "react"
import Confetti from "react-confetti"

/**
 * The general type for useWindowSize hook, which includes width and height.
 */
type Size = {
  width: number | undefined
  height: number | undefined
}

/**
 * A necessary hook to resize the React Confetti. It's a bit of an anti-pattern.
 *
 * Source: https://usehooks.com/useWindowSize/
 */
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

/**
 * `<ReactConfetti>` is a Client Component because it uses the useState hook.
 *
 * It covers the screen in a fun confetti explosion. What's better than that?
 */
export default function ReactConfetti() {
  const { width, height } = useWindowSize()
  return <Confetti width={width} height={height} />
}
