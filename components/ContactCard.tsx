import { Dispatch, SetStateAction } from "react"
import ContactCardEmail from "@/components/ContactCardEmail"
import ContactCardLabelAndData from "@/components/ContactCardLabelAndData"
import ContactCardPhoneNumber from "@/components/ContactCardPhoneNumber"
import ContactCardPhotoAndHeading from "@/components/ContactCardPhotoAndHeading"
import { Contact } from "@/types/Contact"
import { DialogState } from "@/types/DialogState"
import transformBirthday from "@/utils/transformBirthday"

function Address({ contact }: { contact: Contact }) {
  const { streetAddress, city, state, zipCode } = contact || {
    streetAddress: "",
    city: "",
    state: "",
    zipCode: "",
  }

  return (
    <div className="flex flex-col">
      <span>{streetAddress}</span>
      <span>
        {city}
        {city ? ", " : ""}
        {state}
      </span>
      <span>{zipCode}</span>
    </div>
  )
}

export default function ContactCard({
  contact,
  setDialogState,
}: {
  contact: Contact
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { birthYear, birthMonth, birthDay, phoneNumber, email } = contact
  return (
    <div className="flex w-full flex-col items-start justify-between space-y-6 border border-solid border-gray-200 p-6 uppercase shadow-lg filter xl:space-y-8 xl:p-8 dark:border-gray-800">
      <ContactCardPhotoAndHeading
        contact={contact}
        setDialogState={setDialogState}
      />
      <div className="grid w-full grid-cols-1 space-y-6 sm:grid-cols-2 sm:space-y-0 sm:gap-y-4 xl:grid-cols-4 xl:gap-0">
        <ContactCardLabelAndData
          label="Birthday"
          data={transformBirthday({ birthYear, birthMonth, birthDay })}
        />
        <ContactCardLabelAndData
          label="Address"
          data={<Address contact={contact} />}
        />
        <ContactCardLabelAndData
          label="Phone Number"
          data={<ContactCardPhoneNumber phoneNumber={phoneNumber || ""} />}
        />
        <ContactCardLabelAndData
          label="Email Address"
          data={<ContactCardEmail email={email || ""} />}
        />
      </div>
    </div>
  )
}
