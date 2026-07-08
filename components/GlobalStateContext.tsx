import { createContext } from "react"
import { InterpreterFrom } from "xstate"
import phoneBookMachine from "@/utils/phoneBookMachine"

const GlobalStateContext = createContext({
  phoneBookService: {} as InterpreterFrom<typeof phoneBookMachine>,
})

export default GlobalStateContext
