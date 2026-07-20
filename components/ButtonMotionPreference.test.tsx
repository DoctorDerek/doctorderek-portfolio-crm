import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it } from "vitest"
import ButtonMotionPreference from "@/components/ButtonMotionPreference"
import MotionPreferenceProvider from "@/components/MotionPreferenceContext"

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
})
