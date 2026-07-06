export type Contact = {
  id: number
  firstName: string
  lastName: string
  birthYear?: string
  birthMonth?: string
  birthDay?: string
  age?: number
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

export type AgeRange = {
  label: string
  rangeBottom: number
  rangeTop: number
}

export type DialogState = {
  type: "CLOSED" | "CREATE" | "UPDATE" | "DELETE" | "RESET"
  contact?: Contact
}
