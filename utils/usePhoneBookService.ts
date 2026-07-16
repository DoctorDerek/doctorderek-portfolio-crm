import { useSelector } from "@xstate/react"
import { useContext } from "react"
import GlobalStateContext from "@/components/GlobalStateContext"

export default function usePhoneBookService() {
  const globalServices = useContext(GlobalStateContext)
  const phoneBookState = useSelector(
    globalServices.phoneBookService,
    (state) => state,
  )
  const { send } = globalServices.phoneBookService

  return { phoneBookState, send }
}
