import phoneBookMachine from "@/utils/phoneBookMachine"
import { createContext } from "react"
import { InterpreterFrom } from "xstate"

const GlobalStateContext = createContext({
  phoneBookService: {} as InterpreterFrom<typeof phoneBookMachine>,
})

export default GlobalStateContext
