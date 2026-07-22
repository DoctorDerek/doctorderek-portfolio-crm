import { SparklesIcon } from "@heroicons/react/24/outline"
import {
  MotionPreference,
  useMotionPreference,
} from "@/components/MotionPreferenceContext"

const MOTION_PREFERENCE_DESCRIPTIONS: Record<MotionPreference, string> = {
  system: "Follows your device’s reduced-motion setting.",
  reduce: "Pauses decorative motion and uses instant transitions.",
  full: "Allows the complete animation experience.",
}

export default function ButtonMotionPreference() {
  const { motionPreference, setMotionPreference } = useMotionPreference()

  return (
    <label className="flex min-h-10 items-center gap-2 rounded-full border border-gray-600 px-3 text-xs font-semibold tracking-wide transition-colors hover:border-yellow-300 hover:text-yellow-300">
      <SparklesIcon className="h-5 w-5" aria-hidden="true" />
      <span className="hidden 2xl:inline" aria-hidden="true">
        Reduced motion
      </span>
      <select
        value={motionPreference}
        aria-label="Reduced motion"
        aria-describedby="motion-preference-description"
        className="cursor-pointer bg-black text-xs font-semibold text-white focus-visible:ring-2 focus-visible:ring-yellow-400"
        onChange={(event) =>
          setMotionPreference(event.currentTarget.value as MotionPreference)
        }
      >
        <option value="system">System</option>
        <option value="reduce">On</option>
        <option value="full">Off</option>
      </select>
      <span id="motion-preference-description" className="sr-only">
        {MOTION_PREFERENCE_DESCRIPTIONS[motionPreference]}
      </span>
    </label>
  )
}
