import { SparklesIcon } from "@heroicons/react/24/outline"
import { useMotionPreference } from "@/components/MotionPreferenceContext"

export default function ButtonMotionPreference() {
  const { animationsEnabled, toggleAnimations } = useMotionPreference()
  const label = animationsEnabled ? "Turn animations off" : "Turn animations on"

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={animationsEnabled}
      title={label}
      className="flex min-h-10 items-center gap-2 rounded-full border border-gray-600 px-3 text-xs font-semibold tracking-wide transition-colors hover:border-yellow-300 hover:text-yellow-300"
      onClick={toggleAnimations}
    >
      <SparklesIcon className="h-5 w-5" aria-hidden="true" />
      <span className="hidden sm:inline">
        Motion {animationsEnabled ? "on" : "off"}
      </span>
    </button>
  )
}
