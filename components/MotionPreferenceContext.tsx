"use client"

import { MotionConfig } from "motion/react"
import {
  createContext,
  ReactNode,
  useContext,
  useLayoutEffect,
  useSyncExternalStore,
} from "react"

const MOTION_PREFERENCE_STORAGE_KEY = "portfolio-crm-motion-preference"
const LEGACY_MOTION_PREFERENCE_STORAGE_KEY = "portfolio-crm-animations-enabled"
const MOTION_PREFERENCE_CHANGE_EVENT = "portfolio-crm-motion-change"
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)"

export type MotionPreference = "system" | "reduce" | "full"

type MotionPreferenceContextValue = {
  motionPreference: MotionPreference
  setMotionPreference: (motionPreference: MotionPreference) => void
  shouldReduceMotion: boolean
}

const MotionPreferenceContext = createContext<
  MotionPreferenceContextValue | undefined
>(undefined)

const isMotionPreference = (
  storedMotionPreference: string | null,
): storedMotionPreference is MotionPreference =>
  storedMotionPreference === "system" ||
  storedMotionPreference === "reduce" ||
  storedMotionPreference === "full"

function subscribeToMotionPreference(onPreferenceChange: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (
      event.key === null ||
      event.key === MOTION_PREFERENCE_STORAGE_KEY ||
      event.key === LEGACY_MOTION_PREFERENCE_STORAGE_KEY
    ) {
      onPreferenceChange()
    }
  }

  window.addEventListener("storage", handleStorageChange)
  window.addEventListener(MOTION_PREFERENCE_CHANGE_EVENT, onPreferenceChange)

  return () => {
    window.removeEventListener("storage", handleStorageChange)
    window.removeEventListener(
      MOTION_PREFERENCE_CHANGE_EVENT,
      onPreferenceChange,
    )
  }
}

function getMotionPreferenceSnapshot() {
  const storedMotionPreference = localStorage.getItem(
    MOTION_PREFERENCE_STORAGE_KEY,
  )
  if (isMotionPreference(storedMotionPreference)) return storedMotionPreference

  const legacyAnimationsEnabled = localStorage.getItem(
    LEGACY_MOTION_PREFERENCE_STORAGE_KEY,
  )
  if (legacyAnimationsEnabled === "false") return "reduce"
  if (legacyAnimationsEnabled === "true") return "full"
  return "system"
}

const getSystemReducedMotionSnapshot = () =>
  window.matchMedia(REDUCED_MOTION_MEDIA_QUERY).matches

function subscribeToSystemReducedMotion(onSystemPreferenceChange: () => void) {
  const reducedMotionMediaQuery = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY)
  reducedMotionMediaQuery.addEventListener("change", onSystemPreferenceChange)

  return () =>
    reducedMotionMediaQuery.removeEventListener(
      "change",
      onSystemPreferenceChange,
    )
}

export function useMotionPreference() {
  const motionPreference = useContext(MotionPreferenceContext)
  if (!motionPreference)
    throw new Error("Motion preference must be used within its provider.")
  return motionPreference
}

export default function MotionPreferenceProvider({
  children,
}: {
  children: ReactNode
}) {
  const motionPreference = useSyncExternalStore<MotionPreference>(
    subscribeToMotionPreference,
    getMotionPreferenceSnapshot,
    () => "system",
  )
  const systemShouldReduceMotion = useSyncExternalStore(
    subscribeToSystemReducedMotion,
    getSystemReducedMotionSnapshot,
    () => false,
  )
  const shouldReduceMotion =
    motionPreference === "reduce" ||
    (motionPreference === "system" && systemShouldReduceMotion)
  const reducedMotion =
    motionPreference === "system"
      ? "user"
      : shouldReduceMotion
        ? "always"
        : "never"

  useLayoutEffect(() => {
    document.documentElement.dataset.motionPreference = motionPreference
    return () => {
      delete document.documentElement.dataset.motionPreference
    }
  }, [motionPreference])

  const setMotionPreference = (nextMotionPreference: MotionPreference) => {
    window.localStorage.setItem(
      MOTION_PREFERENCE_STORAGE_KEY,
      nextMotionPreference,
    )
    window.dispatchEvent(new Event(MOTION_PREFERENCE_CHANGE_EVENT))
  }

  return (
    <MotionPreferenceContext.Provider
      value={{ motionPreference, setMotionPreference, shouldReduceMotion }}
    >
      <MotionConfig reducedMotion={reducedMotion}>{children}</MotionConfig>
    </MotionPreferenceContext.Provider>
  )
}
