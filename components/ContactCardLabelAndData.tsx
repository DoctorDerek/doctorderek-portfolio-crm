import { ReactNode } from "react"

export default function ContactCardLabelAndData({
  label,
  data,
}: {
  label: ReactNode
  data: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col wrap-anywhere">
      <span className="text-xs tracking-widest text-gray-700 dark:text-gray-300">
        {label}
      </span>
      <span className="text-sm font-bold tracking-wide">{data}</span>
    </div>
  )
}
