import { useActor } from "@xstate/react"
import { useContext } from "react"
import GlobalStateContext from "@/components/GlobalStateContext"

/** Return `phoneBookState` and `send` from the XState finite state machine. */
export default function usePhoneBookService() {
  const globalServices = useContext(GlobalStateContext)
  const [phoneBookState] = useActor(globalServices.phoneBookService)
  const { send } = globalServices.phoneBookService

  return { phoneBookState, send }
}
