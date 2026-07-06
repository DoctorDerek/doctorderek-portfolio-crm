/** All fields are optional for a Contact, except for the name and unique ID. */
export type Contact = {
  /** Uniqueness of the ID is enforced by the XState finite state machine. */
  id: number
  /** We separate first and last names, and both are required. */
  firstName: string
  lastName: string
  /**
   * Birthdays are initialized using the syntax `new Date("1990-01-01")`.
   * We separate year, month & day to make it easier for the user to enter.
   * */
  birthYear?: string
  birthMonth?: string
  birthDay?: string
  /** The contact's age is calculated from their birthday automatically. */
  age?: number
  /** The contact's photo, a filename in the `@/public/contacts/` directory. */
  photo?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  phoneNumber?: string
  email?: string
  password?: string
  securityQuestion?: string
  securityQuestionAnswer?: string
}

/**
 * Our mock data is used to initialize the XState finite state machine and
 * contains all fields for each contact, except age, which will be calculated. */
const CONTACTS: Contact[] = [
  {
    id: 1,
    photo: "Unsplash Jessica Christian.png",
    firstName: "Jessica",
    lastName: "Christian",
    birthYear: "2022", // Baby
    birthMonth: "05",
    birthDay: "30",
    streetAddress: "1234 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    phoneNumber: "555-555-5555",
    email: "Jessica.Christian@fakeEmail.com",
  },
  {
    id: 2,
    photo: "Unsplash Lia Bekyan.png",
    firstName: "Lia",
    lastName: "Bekyan",
    birthYear: "2010", // Child
    birthMonth: "09",
    birthDay: "24",
    streetAddress: "1234 Happy Lane",
    city: "San Diego",
    state: "CA",
    zipCode: "91911",
    phoneNumber: "555-555-5555",
    email: "Lia.Bekyan@fakeEmail.com",
  },
  {
    id: 3,
    photo: "Unsplash Remy Loz.png",
    firstName: "Remy",
    lastName: "Loz",
    birthYear: "2000", // Young Adult
    birthMonth: "07",
    birthDay: "04",
    streetAddress: "1234 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    phoneNumber: "555-555-5555",
    email: "Remy.Loz@fakeEmail.com",
  },
  {
    id: 4,
    photo: "Unsplash Ryan Hoffman.png",
    firstName: "Ryan",
    lastName: "Hoffman",
    birthYear: "1990", // Middle Aged Adult
    birthMonth: "04",
    birthDay: "06",
    streetAddress: "1234 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    phoneNumber: "555-555-5555",
    email: "Ryan.Hoffman@fakeEmail.com",
  },
  {
    id: 5,
    photo: "Unsplash Tadas Petrokas.png",
    firstName: "Tadas",
    lastName: "Petrokas",
    birthYear: "1956", // Senior
    birthMonth: "08",
    birthDay: "07",
    streetAddress: "1234 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    phoneNumber: "555-555-5555",
    email: "Tadas.Petrokas@fakeEmail.com",
  },
  {
    id: 6,
    photo: "Unsplash Yohan Marion.png",
    firstName: "Yohan",
    lastName: "Marion",
    birthYear: "1890", // Senior
    birthMonth: "11",
    birthDay: "24",
    streetAddress: "1234 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94111",
    phoneNumber: "555-555-5555",
    email: "Yohan.Marion@fakeEmail.com",
  },
]

export const calculateAge = ({
  birthYear,
  birthMonth,
  birthDay,
}: {
  birthYear?: string
  birthMonth?: string
  birthDay?: string
}) => {
  // We can't calculate age without a birthday.
  if (!(birthYear && birthMonth && birthDay)) return undefined
  const today = new Date()
  const birthDate = new Date(`${birthYear}-${birthMonth}-${birthDay}`)
  const age = today.getFullYear() - birthDate.getFullYear()
  // This may not be their age, if their birthday hasn't yet occurred this year.
  const month = today.getMonth() - birthDate.getMonth()
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    // They haven't had their birthday yet this year, so their age is one less.
    return age - 1
  }
  return age
}

/** We flesh out the mock data by calculating the age for each contact. */
const CONTACTS_WITH_AGES: Contact[] = CONTACTS.map((contact) => {
  const { birthYear, birthMonth, birthDay } = contact
  const age = calculateAge({ birthYear, birthMonth, birthDay })
  return { ...contact, age }
})

// Let's pre-sort the contacts before we use them, so we'll have a default sort.
export const sortByLastName = (a: Contact, b: Contact) => {
  // We're going to assume that the last name is the last word in the name, but
  // that may be incorrect, especially with many Asian or Hispanic names.
  const aName = a?.lastName || ""
  const bName = b?.lastName || ""
  // We .pop() to get the last word in the name, and then we use .toLowerCase():
  const aLastName = aName.split(" ").pop()?.toLocaleLowerCase() || ""
  const bLastName = bName.split(" ").pop()?.toLocaleLowerCase() || ""
  return aLastName.localeCompare(bLastName)
}

// We mutate the CONTACTS_WITH_AGES array to sort it by last name before export.
CONTACTS_WITH_AGES.sort(sortByLastName)

export default CONTACTS_WITH_AGES
