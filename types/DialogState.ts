import { Contact } from "@/types/Contact"

export type DialogState =
  | { type: "CLOSED"; contact?: never }
  | { type: "CREATE" }
  | { type: "UPDATE"; contact: Contact }
  | { type: "DELETE"; contact: Contact }
  | { type: "RESET"; contact?: never }
