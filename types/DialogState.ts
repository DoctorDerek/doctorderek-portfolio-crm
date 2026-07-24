import { Contact } from "@/types/Contact"

export type DialogState =
  | { type: "CLOSED" }
  | { type: "CREATE" }
  | { type: "UPDATE"; contact: Contact }
  | { type: "DELETE"; contact: Contact }
  | { type: "RESET" }
