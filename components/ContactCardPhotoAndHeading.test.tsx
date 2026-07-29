import { fireEvent, render, screen } from "@testing-library/react"
import type { ComponentProps } from "react"
import { describe, expect, it, vi } from "vitest"
import ContactCardPhotoAndHeading, {
  IMAGE_QUALITY,
  IMAGE_SIZES,
} from "@/components/ContactCardPhotoAndHeading"
import { Contact } from "@/types/Contact"

type MockImageProps = ComponentProps<"img"> & {
  fill?: boolean
  quality?: number
  sizes?: string
}

vi.mock("next/image", () => ({
  default: ({ fill: _fill, quality, sizes, ...props }: MockImageProps) => (
    <div
      role="img"
      aria-label={props.alt}
      data-quality={quality}
      data-sizes={sizes}
      data-src={props.src}
    />
  ),
}))

const contact: Contact = {
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  photo: "Ada Lovelace.png",
  phoneNumber: "555-555-5555",
}

describe("contact card photo and heading", () => {
  it("renders an optimized avatar with the fixed display dimensions", () => {
    render(<ContactCardPhotoAndHeading contact={contact} />)

    const image = screen.getByRole("img", { name: "Ada Lovelace" })

    expect(image).toHaveAttribute("data-src", "/contacts/Ada Lovelace.png")
    expect(image).toHaveAttribute("data-sizes", IMAGE_SIZES)
    expect(image).toHaveAttribute("data-quality", String(IMAGE_QUALITY))
    expect(
      screen.queryByRole("button", {
        name: "Reorder Ada Lovelace by dragging",
      }),
    ).not.toBeInTheDocument()
  })

  it("renders the avatar fallback when no photo is available", () => {
    render(
      <ContactCardPhotoAndHeading contact={{ ...contact, photo: undefined }} />,
    )

    expect(screen.queryByRole("img")).not.toBeInTheDocument()
  })

  it("handles contact actions without changing avatar behavior", () => {
    const setDialogState = vi.fn()
    const onToggleFavorite = vi.fn()
    const onDragStart = vi.fn()
    const onMoveContact = vi.fn()

    const { rerender } = render(
      <ContactCardPhotoAndHeading
        contact={contact}
        setDialogState={setDialogState}
        onToggleFavorite={onToggleFavorite}
        onDragStart={onDragStart}
        onMoveContact={onMoveContact}
      />,
    )

    fireEvent.pointerDown(
      screen.getByRole("button", {
        name: "Reorder Ada Lovelace by dragging",
      }),
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Move Ada Lovelace up" }),
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Move Ada Lovelace down" }),
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Add Ada Lovelace to favorites" }),
    )
    fireEvent.click(
      screen.getByRole("button", { name: "Delete Ada Lovelace 555-555-5555" }),
    )

    expect(onDragStart).toHaveBeenCalledOnce()
    expect(onMoveContact).toHaveBeenNthCalledWith(1, contact, "up")
    expect(onMoveContact).toHaveBeenNthCalledWith(2, contact, "down")
    expect(onToggleFavorite).toHaveBeenCalledWith(contact)
    expect(setDialogState).toHaveBeenCalledWith({ type: "DELETE", contact })

    rerender(
      <ContactCardPhotoAndHeading
        contact={contact}
        setDialogState={setDialogState}
        onToggleFavorite={onToggleFavorite}
        onDragStart={onDragStart}
        onMoveContact={onMoveContact}
        isFirst
        isLast
      />,
    )

    expect(
      screen.getByRole("button", { name: "Move Ada Lovelace up" }),
    ).toBeDisabled()
    expect(
      screen.getByRole("button", { name: "Move Ada Lovelace down" }),
    ).toBeDisabled()
  })
})
