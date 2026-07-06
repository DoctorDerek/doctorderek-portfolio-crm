import { Contact } from "@/contacts/CONTACTS"
import classNames from "@/utils/classNames"
import { Combobox } from "@headlessui/react"
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid"
import { useEffect, useState } from "react"
import {
  FieldErrorsImpl,
  UseFormGetValues,
  UseFormRegister,
  UseFormSetError,
  UseFormSetValue,
} from "react-hook-form"

type SecurityQuestion = {
  id: number
  question: string
}

const securityQuestions: SecurityQuestion[] = [
  {
    id: 1,
    question: "What was the name of the boy or the girl you first kissed?",
  },
  { id: 2, question: "Where were you when you had your first kiss?" },
  {
    id: 3,
    question: "In what city did you meet your spouse/significant other?",
  },
  { id: 4, question: "What is the middle name of your youngest child?" },
  { id: 5, question: "What was the name of your first stuffed animal?" },
  { id: 6, question: "In what city or town did your mother and father meet?" },
  { id: 7, question: "What was the first exam you failed?" },
]

export default function ContactDialogSecurityQuestions({
  setValue,
  errors,
  register,
}: {
  setValue: UseFormSetValue<Contact>
  errors: Partial<FieldErrorsImpl<Contact>>
  register: UseFormRegister<Contact>
}) {
  const [query, setQuery] = useState("")
  const [selectedSecurityQuestion, setSelectedSecurityQuestion] =
    useState<SecurityQuestion | null>(null)

  const filteredSecurityQuestions =
    query === ""
      ? securityQuestions
      : securityQuestions.filter((securityQuestion) => {
          return securityQuestion.question
            .toLowerCase()
            .includes(query.toLowerCase())
        })

  const handleChange = (securityQuestion: SecurityQuestion | null) => {
    setSelectedSecurityQuestion(securityQuestion)
    setValue("securityQuestion", securityQuestion?.question)
  }

  return (
    <Combobox
      as="div"
      value={selectedSecurityQuestion}
      onChange={handleChange}
      className="relative top-3"
    >
      <Combobox.Label className="absolute -top-3 left-3 z-10 inline-block bg-white px-1 text-sm font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">
        Security Question
      </Combobox.Label>
      <div className="relative mt-2">
        <Combobox.Input
          className={classNames(
            "block w-full rounded-md border-0 px-2 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:px-2 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 disabled:ring-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500 dark:ring-gray-700 dark:focus:ring-gray-500 dark:disabled:bg-gray-950 dark:disabled:text-gray-800 dark:disabled:ring-gray-950 sm:text-sm sm:leading-6",
            errors?.securityQuestion
              ? "ring-2 ring-red-500 dark:ring-red-900"
              : "",
          )}
          displayValue={(securityQuestion) =>
            (securityQuestion as SecurityQuestion)?.question
          }
          placeholder="Select a security question"
          {...register("securityQuestion", {
            required: "Please select a security question.",
          })}
        />
        <Combobox.Button className="absolute inset-y-0 right-0 flex items-center rounded-r-md px-2 focus:outline-none">
          <ChevronUpDownIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </Combobox.Button>

        {filteredSecurityQuestions.length > 0 && (
          <Combobox.Options className="absolute z-10 mt-1 max-h-96 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredSecurityQuestions.map((securityQuestion) => (
              <Combobox.Option
                key={securityQuestion.id}
                value={securityQuestion}
                className={({ active }) =>
                  classNames(
                    "relative cursor-default select-none py-2 pl-8 pr-4",
                    active ? "bg-indigo-600 text-white" : "text-gray-900",
                  )
                }
              >
                {({ active }) => (
                  <>
                    <span
                      className={classNames(
                        "block truncate",
                        selectedSecurityQuestion?.question ===
                          securityQuestion.question
                          ? "font-semibold"
                          : "",
                      )}
                    >
                      {securityQuestion.question}
                    </span>

                    {selectedSecurityQuestion?.question ===
                      securityQuestion.question && (
                      <span
                        className={classNames(
                          "absolute inset-y-0 left-0 flex items-center pl-1.5",
                          active ? "text-white" : "text-indigo-600",
                        )}
                      >
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Combobox.Option>
            ))}
          </Combobox.Options>
        )}
      </div>
    </Combobox>
  )
}
