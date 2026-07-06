import ContactCardEmail from "@/components/ContactCardEmail"
import ContactCardLabelAndData from "@/components/ContactCardLabelAndData"
import ContactCardPhoneNumber from "@/components/ContactCardPhoneNumber"
import ContactCardPhotoAndHeading from "@/components/ContactCardPhotoAndHeading"
import { DialogState } from "@/components/ContactDialog"
import { Contact } from "@/contacts/CONTACTS"
import transformBirthday from "@/utils/transformBirthday"
import { Dispatch, SetStateAction } from "react"

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

/**
 * The photo floats left of a heading with the contact's name above their city.
 * The contact's birthday, address, phone number, and email address follow.
 *
 * Design: https://www.figma.com/file/bgqegwF2VfeZ6qlJZ0FLVB/Exercise
 * */
export default function ContactCard({
  contact,
  setDialogState,
}: {
  contact: Contact
  setDialogState: Dispatch<SetStateAction<DialogState>>
}) {
  const { birthYear, birthMonth, birthDay, phoneNumber, email } = contact
  return (
    <div className="flex w-full flex-col items-start justify-between space-y-6 border border-solid border-gray-200 p-6 uppercase shadow-lg filter dark:border-gray-800 xl:space-y-8 xl:p-8">
      {/** The entire `<ContactCard>` component uses UPPERCASE text. */}
      <ContactCardPhotoAndHeading
        contact={contact}
        setDialogState={setDialogState}
      />
      <div className="grid w-full grid-cols-1 space-y-6 sm:grid-cols-2 sm:gap-y-4 sm:space-y-0 xl:grid-cols-4 xl:gap-0">
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
