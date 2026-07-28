import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ReactConfetti from "@/components/ReactConfetti"

let shouldReduceMotion: boolean | null = false

vi.mock("motion/react", async () => {
  const actual =
    await vi.importActual<typeof import("motion/react")>("motion/react")
  return {
    ...actual,
    useReducedMotion: () => shouldReduceMotion,
  }
})

vi.mock("react-confetti", () => ({
  default: ({ width, height }: { width?: number; height?: number }) => (
    <output
      aria-label="Confetti viewport"
      data-height={height}
      data-width={width}
    />
  ),
}))

function setViewportSize(width: number, height: number) {
  Object.defineProperties(window, {
    innerWidth: { configurable: true, value: width },
    innerHeight: { configurable: true, value: height },
  })
}

function renderConfetti() {
  return render(<ReactConfetti />)
}

describe("confetti viewport", () => {
  beforeEach(() => {
    shouldReduceMotion = false
  })

  it("matches the browser viewport and responds to resizing", async () => {
    setViewportSize(390, 844)
    renderConfetti()

    const confettiViewport = screen.getByLabelText("Confetti viewport")
    await waitFor(() => {
      expect(confettiViewport).toHaveAttribute("data-width", "390")
      expect(confettiViewport).toHaveAttribute("data-height", "844")
    })

    setViewportSize(1280, 720)
    fireEvent(window, new Event("resize"))

    await waitFor(() => {
      expect(confettiViewport).toHaveAttribute("data-width", "1280")
      expect(confettiViewport).toHaveAttribute("data-height", "720")
    })
  })

  it("omits decorative confetti when reduced motion is active", () => {
    shouldReduceMotion = true

    renderConfetti()

    expect(screen.queryByLabelText("Confetti viewport")).not.toBeInTheDocument()
  })

  it("omits decorative confetti when motion preference is unresolved", () => {
    shouldReduceMotion = null

    renderConfetti()

    expect(screen.queryByLabelText("Confetti viewport")).not.toBeInTheDocument()
  })
})
