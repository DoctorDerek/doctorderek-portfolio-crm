import { cleanup } from "@testing-library/react"
import { afterEach, vi } from "vitest"
import "@testing-library/jest-dom/vitest"

afterEach(() => {
  cleanup()
})

/**
 * ONE-TIME EXCEPTION TO NO CODE COMMENT RULE:
 * Required mock for Happy-DOM/JSDOM to prevent crashes when components
 * (e.g., using next-themes, framer-motion, MUI) evaluate media queries.
 */
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})
