import { ReactNode } from "react"

export default function ContactCardLabelAndData({
  label,
  data,
}: {
  label: ReactNode
  data: ReactNode
}) {
  return (
    <div className="flex flex-col">
      <span className="text-xs tracking-widest text-gray-600 dark:text-gray-300">
        {label}
      </span>
      <span className="text-sm font-bold tracking-wide">{data}</span>
    </div>
  )
}
