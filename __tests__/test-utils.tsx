// @/__tests__/test-utils.tsx
//
// In this file, we set up some global mocks and custom renderers for tests.
//
// The following is the correct import syntax for our *.test.tsx files:
// import { render, screen } from "@/utils/test_utils"
//
// Note: This syntax replaces any imports from "@testing-library/react".
//
import { render, RenderOptions } from "@testing-library/react"
import { ReactElement, ReactNode } from "react"

// **Global Mocks**
// Mocks that are included here in `@/__tests__/test-utils` apply to all tests.

// We mock Next.js's useRouter hook using the "next-router-mock" package:
jest.mock("next/dist/client/router", () =>
  jest.requireActual("next-router-mock"),
)
jest.mock("next/dist/shared/lib/router-context", () => {
  const { createContext } = jest.requireActual("react")
  const router = jest.requireActual("next-router-mock").default
  const RouterContext = createContext(router)
  return { RouterContext }
})
// Reference: https://github.com/scottrippey/next-router-mock/issues/58#issuecomment-1182861712

// **Custom Providers**
// Any providers used in the future (e.g. themes) would need to be added here:
const CustomProviders = ({ children }: { children: ReactNode }) =>
  children as JSX.Element
// We typecast to JSX.Element, since we have no wrapping JSX elements.

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) => render(ui, { wrapper: CustomProviders, ...options })

export * from "@testing-library/react"
export { customRender as render }
