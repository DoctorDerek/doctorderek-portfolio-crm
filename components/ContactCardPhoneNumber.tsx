import { PhoneIcon } from "@heroicons/react/24/solid"

export default function ContactCardPhoneNumber({
  phoneNumber,
}: {
  phoneNumber: string
}) {
  return (
    <a
      href={`tel:${phoneNumber}`}
      className="group flex items-center justify-start space-x-1 text-sm font-medium"
    >
      <span className="font-bold text-gray-950 dark:text-gray-200">
        {phoneNumber}
      </span>
      <PhoneIcon
        className="invisible h-2.5 w-2.5 group-hover:visible group-hover:fill-green-400"
        aria-label="Call"
      />
      <div className="invisible pt-0.5 text-xs font-bold text-green-400 group-hover:visible">
        call
      </div>
    </a>
  )
}
