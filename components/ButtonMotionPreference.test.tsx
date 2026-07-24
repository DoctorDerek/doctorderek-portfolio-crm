import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import ButtonMotionPreference from "@/components/ButtonMotionPreference"
import MotionPreferenceProvider, {
  useMotionPreference,
} from "@/components/MotionPreferenceContext"

let systemShouldReduceMotion = false
let notifySystemPreferenceChange: (() => void) | undefined

function MotionPreferenceStatus() {
  const { motionPreference, shouldReduceMotion } = useMotionPreference()
  return (
    <output
      aria-label="Motion preference status"
      data-preference={motionPreference}
      data-reduced={shouldReduceMotion}
    />
  )
}

function renderMotionPreference() {
  return render(
    <MotionPreferenceProvider>
      <ButtonMotionPreference />
      <MotionPreferenceStatus />
    </MotionPreferenceProvider>,
  )
}

function expectMotionPreference(
  motionPreference: "system" | "reduce" | "full",
  shouldReduceMotion: boolean,
) {
  expect(screen.getByLabelText("Motion preference")).toHaveValue(
    motionPreference,
  )
  expect(screen.getByLabelText("Motion preference status")).toHaveAttribute(
    "data-reduced",
    String(shouldReduceMotion),
  )
  expect(document.documentElement).toHaveAttribute(
    "data-motion-preference",
    motionPreference,
  )
}

describe("motion preference", () => {
  beforeEach(() => {
    localStorage.clear()
    systemShouldReduceMotion = false
    notifySystemPreferenceChange = undefined
    vi.mocked(window.matchMedia).mockImplementation(
      (query) =>
        ({
          matches: systemShouldReduceMotion,
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: (
            _eventType: string,
            listener: EventListenerOrEventListenerObject,
          ) => {
            notifySystemPreferenceChange = () => {
              if (typeof listener === "function") {
                listener(new Event("change"))
              } else {
                listener.handleEvent(new Event("change"))
              }
            }
          },
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    )
  })

  it("follows the system setting by default", () => {
    renderMotionPreference()

    expectMotionPreference("system", false)
    expect(
      screen.getByText("Follows your device’s reduced-motion setting."),
    ).toBeInTheDocument()

    systemShouldReduceMotion = true
    act(() => notifySystemPreferenceChange?.())

    expectMotionPreference("system", true)
  })

  it("persists explicit reduced and full motion choices", () => {
    systemShouldReduceMotion = true
    renderMotionPreference()

    const motionPreferenceSelect = screen.getByLabelText("Motion preference")
    fireEvent.change(motionPreferenceSelect, { target: { value: "full" } })

    expectMotionPreference("full", false)
    expect(localStorage.getItem("portfolio-crm-motion-preference")).toBe("full")

    fireEvent.change(motionPreferenceSelect, { target: { value: "reduce" } })

    expectMotionPreference("reduce", true)
    expect(localStorage.getItem("portfolio-crm-motion-preference")).toBe(
      "reduce",
    )
  })

  it.each([
    { legacyValue: "false", motionPreference: "reduce" },
    { legacyValue: "true", motionPreference: "full" },
  ] as const)(
    "reads legacy $legacyValue as $motionPreference without rewriting it",
    ({ legacyValue, motionPreference }) => {
      localStorage.setItem("portfolio-crm-animations-enabled", legacyValue)

      renderMotionPreference()

      expectMotionPreference(motionPreference, motionPreference === "reduce")
      expect(localStorage.getItem("portfolio-crm-motion-preference")).toBeNull()
      expect(localStorage.getItem("portfolio-crm-animations-enabled")).toBe(
        legacyValue,
      )
    },
  )

  it("synchronizes only relevant motion preference storage events", async () => {
    renderMotionPreference()

    localStorage.setItem("portfolio-crm-motion-preference", "reduce")
    fireEvent(window, new StorageEvent("storage", { key: "unrelated-setting" }))
    expectMotionPreference("system", false)

    fireEvent(
      window,
      new StorageEvent("storage", {
        key: "portfolio-crm-motion-preference",
        newValue: "reduce",
      }),
    )

    await waitFor(() => expectMotionPreference("reduce", true))
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
