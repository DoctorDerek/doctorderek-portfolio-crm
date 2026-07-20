export default function ContactListEmptyState({
  hasContacts,
}: {
  hasContacts: boolean
}) {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center dark:border-gray-700 dark:bg-gray-900">
      <h2 className="text-lg font-bold tracking-wide uppercase">
        {hasContacts ? "No matching contacts" : "No contacts yet"}
      </h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">
        {hasContacts
          ? "Adjust or clear the active filters to see more contacts."
          : "Create a contact to begin building your local portfolio CRM."}
      </p>
    </div>
  )
}
