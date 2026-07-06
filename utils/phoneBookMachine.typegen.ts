// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  "@@xstate/typegen": true
  internalEvents: {
    "xstate.init": { type: "xstate.init" }
  }
  invokeSrcNameMap: {}
  missingImplementations: {
    actions: never
    delays: never
    guards: never
    services: never
  }
  eventsCausingActions: {
    createContact: "CREATE"
    deleteContact: "DELETE"
    readPhoneBookFromLocalStorage: "READ"
    resetPhoneBookEntries: "RESET"
    updateContact: "UPDATE"
    writePhoneBookToLocalStorage: "FINISH"
  }
  eventsCausingDelays: {}
  eventsCausingGuards: {}
  eventsCausingServices: {}
  matchesStates: "idle" | "ready" | "running"
  tags: never
}
