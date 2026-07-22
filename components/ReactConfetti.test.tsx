import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import ReactConfetti from "@/components/ReactConfetti"

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

describe("confetti viewport", () => {
  it("matches the browser viewport and responds to resizing", async () => {
    setViewportSize(390, 844)
    render(<ReactConfetti />)

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
})
