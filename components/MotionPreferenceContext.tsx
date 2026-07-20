"use client"

import { MotionConfig } from "motion/react"
import {
  createContext,
  ReactNode,
  useContext,
  useSyncExternalStore,
} from "react"

const MOTION_PREFERENCE_STORAGE_KEY = "portfolio-crm-animations-enabled"
const MOTION_PREFERENCE_CHANGE_EVENT = "portfolio-crm-motion-change"

type MotionPreference = {
  animationsEnabled: boolean
  toggleAnimations: () => void
}

const MotionPreferenceContext = createContext<MotionPreference | undefined>(
  undefined,
)

function subscribeToMotionPreference(onPreferenceChange: () => void) {
  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === MOTION_PREFERENCE_STORAGE_KEY) onPreferenceChange()
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
  return localStorage.getItem(MOTION_PREFERENCE_STORAGE_KEY) !== "false"
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
  const animationsEnabled = useSyncExternalStore(
    subscribeToMotionPreference,
    getMotionPreferenceSnapshot,
    () => true,
  )

  const toggleAnimations = () => {
    localStorage.setItem(
      MOTION_PREFERENCE_STORAGE_KEY,
      String(!animationsEnabled),
    )
    window.dispatchEvent(new Event(MOTION_PREFERENCE_CHANGE_EVENT))
  }

  return (
    <MotionPreferenceContext.Provider
      value={{ animationsEnabled, toggleAnimations }}
    >
      <MotionConfig reducedMotion={animationsEnabled ? "user" : "always"}>
        {children}
      </MotionConfig>
    </MotionPreferenceContext.Provider>
  )
}
