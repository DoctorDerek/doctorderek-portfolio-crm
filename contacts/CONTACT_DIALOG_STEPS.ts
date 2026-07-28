export const CONTACT_DIALOG_STEPS = [
  { id: "information", label: "Contact information" },
  { id: "review", label: "Review" },
] as const

export type ContactDialogStep = (typeof CONTACT_DIALOG_STEPS)[number]["id"]
