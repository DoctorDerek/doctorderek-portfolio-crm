import { Contact } from "@/types/Contact"

export type DialogState = {
  type: "CLOSED" | "CREATE" | "UPDATE" | "DELETE" | "RESET"
  contact?: Contact
}
