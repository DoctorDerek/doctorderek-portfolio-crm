export type PersistenceFailure = {
  operation: "read" | "write"
  message: string
}
