import { render, screen } from "@/__tests__/test-utils"
import ContactCard from "@/components/ContactCard"
import CONTACTS from "@/contacts/CONTACTS"
import transformBirthday from "@/utils/transformBirthday"

describe("@/components/ContactCard", () => {
  /** We extract the first contact from CONTACTS for our test suite. */
  const contact = CONTACTS[0]

  /** We have to re-render for every test because it's the same component. */
  const renderContact = () =>
    render(<ContactCard contact={contact} setDialogState={() => {}} />)

  // We unpack the contact's properties for easier access and fallback values.

  // For the photo, we have to transform it into a URL for the `src` attribute.
  const photo = contact?.photo?.replaceAll(" ", "%20") || ""
  // We always use case-insensitive search since we expect all UPPERCASE text.
  const firstName = new RegExp(contact.firstName, "i")
  const lastName = new RegExp(contact.lastName, "i")
  const { birthYear, birthMonth, birthDay } = contact
  const birthdayTransformed = new RegExp(
    transformBirthday({ birthYear, birthMonth, birthDay }),
    "i",
  )
  const streetAddress = new RegExp(contact.streetAddress || "", "i")
  const city = new RegExp(contact.city || "", "i")
  // The state is the exception; it's uppercase, so we search case-sensitive.
  const state = new RegExp(contact.state || "", "")
  const zipCode = new RegExp(contact.zipCode || "", "i")
  const phoneNumber = new RegExp(contact.phoneNumber || "", "i")
  const splitEmail = contact.email?.split("@") || []
  // We don't use RegExp here to avoid matching John.Doe (email) as John Doe.
  const emailName = splitEmail[0] || ""
  const emailDomain = splitEmail[1] || ""
  // The age isn't rendered to the screen, so we're not going to test it here.
  // const age = contact.age || -Infinity

  it("renders the expected labels of birthday, address, phone number, and email address", () => {
    renderContact()
    expect(screen.getByText(/birthday/i)).toBeVisible()
    // We expect the word address twice: 1 for street address and 1 for email.
    const addresses = screen.getAllByText(/address/i)
    expect(addresses[0]).toBeVisible()
    expect(addresses[1]).toBeVisible()
    // There is no "street" in the text so we can't search "street address".
    expect(screen.getByText(/phone number/i)).toBeVisible()
    expect(screen.getByText(/email address/i)).toBeVisible()
  })

  it("renders the contact's photo with alt text", () => {
    renderContact()
    // We check for the required alt text for accessibility.
    const image = screen.getByRole("img", {
      name: `${contact.firstName} ${contact.lastName}`,
    })
    // The src attribute should include the URL `/contacts/${photo}`.
    expect(image).toHaveAttribute(
      "src",
      expect.stringMatching(`%2Fcontacts%2F${photo}`), // %2F is a forward slash.
    )
  })

  it("renders the contact's name", () => {
    renderContact()
    const firstNameResults = screen.getAllByText(firstName)
    const lastNameResults = screen.getAllByText(lastName)
    // We expect the first name and last name to be visible.
    expect(firstNameResults[0]).toBeVisible()
    expect(lastNameResults[0]).toBeVisible()
    // We expect the first name and last name to be in the same element.
    expect(firstNameResults[0]).toBe(lastNameResults[0])
    // We expect the first name and last name to be in the same element.
    expect(firstNameResults[1]).toBe(lastNameResults[1])
  })

  it("renders the contact's city x 2 times", () => {
    renderContact()
    // We expect the city under the contact's name and in the street address.
    const cities = screen.getAllByText(city)
    expect(cities).toHaveLength(2)
    expect(cities[0]).toBeVisible()
    expect(cities[1]).toBeVisible()
  })

  it("renders the contact's birthday", () => {
    renderContact()
    expect(screen.getByText(birthdayTransformed)).toBeVisible()
  })

  it("renders the contact's street address", () => {
    renderContact()
    expect(screen.getByText(streetAddress)).toBeVisible()
    // We already checked for the contact's city in the previous test.
    expect(screen.getByText(state)).toBeVisible()
    expect(screen.getByText(zipCode)).toBeVisible()
  })

  it("renders the contact's phone number", () => {
    renderContact()
    expect(screen.getByText(phoneNumber)).toBeVisible()
  })

  it("renders the contact's email", () => {
    renderContact()
    // We allow the email address to wrap on some screen sizes, mainly tablet.
    expect(screen.getByText(emailName)).toBeVisible()
    expect(screen.getByText(emailDomain)).toBeVisible()
    expect(screen.getByText("@")).toBeVisible()
  })
})
