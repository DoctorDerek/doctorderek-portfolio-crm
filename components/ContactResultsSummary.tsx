export default function ContactResultsSummary({
  filteredContactCount,
  totalContactCount,
}: {
  filteredContactCount: number
  totalContactCount: number
}) {
  const contactLabel = totalContactCount === 1 ? "contact" : "contacts"

  return (
    <p
      className="text-sm font-medium tracking-wide text-gray-600 dark:text-gray-300"
      role="status"
      aria-live="polite"
    >
      Showing {filteredContactCount} of {totalContactCount} {contactLabel}
    </p>
  )
}
