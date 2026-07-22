import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import ButtonMotionPreference from "@/components/ButtonMotionPreference"
import MotionPreferenceProvider, {
  useMotionPreference,
} from "@/components/MotionPreferenceContext"

function renderMotionPreference() {
  return render(
    <MotionPreferenceProvider>
      <ButtonMotionPreference />
    </MotionPreferenceProvider>,
  )
}

describe("motion preference", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("enables motion by default and persists an explicit opt-out", () => {
    renderMotionPreference()

    const motionPreferenceButton = screen.getByRole("button", {
      name: "Turn animations off",
    })
    expect(motionPreferenceButton).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(motionPreferenceButton)

    expect(
      screen.getByRole("button", { name: "Turn animations on" }),
    ).toHaveAttribute("aria-pressed", "false")
    expect(localStorage.getItem("portfolio-crm-animations-enabled")).toBe(
      "false",
    )
  })

  it("restores the persisted motion preference", () => {
    localStorage.setItem("portfolio-crm-animations-enabled", "false")

    renderMotionPreference()

    expect(
      screen.getByRole("button", { name: "Turn animations on" }),
    ).toHaveAttribute("aria-pressed", "false")
  })

  it("synchronizes only relevant motion preference storage events", async () => {
    renderMotionPreference()
    const enabledButton = screen.getByRole("button", {
      name: "Turn animations off",
    })

    localStorage.setItem("portfolio-crm-animations-enabled", "false")
    fireEvent(window, new StorageEvent("storage", { key: "unrelated-setting" }))
    expect(enabledButton).toBeInTheDocument()

    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "portfolio-crm-animations-enabled",
        newValue: "false",
      }),
    )

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Turn animations on" }),
      ).toHaveAttribute("aria-pressed", "false")
    })
  })

  it("rejects motion preference access outside its provider", () => {
    function MotionPreferenceConsumer() {
      useMotionPreference()
      return null
    }

    expect(() => render(<MotionPreferenceConsumer />)).toThrow(
      "Motion preference must be used within its provider.",
    )
  })
})
