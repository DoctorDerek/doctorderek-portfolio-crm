import { fireEvent, render, screen } from "@testing-library/react"
import type { ImageProps } from "next/image"
import { describe, expect, it, vi } from "vitest"
import ContactCardPhotoAndHeading from "@/components/ContactCardPhotoAndHeading"
import { Contact } from "@/types/Contact"

function getImageSource(source: ImageProps["src"]) {
  if (typeof source === "string") return source
  if ("src" in source) return source.src
  return source.default.src
}

vi.mock("next/image", () => ({
  default: ({ src, alt, unoptimized, loading, fetchPriority }: ImageProps) => (
    <div
      role="img"
      aria-label={alt}
      data-src={getImageSource(src)}
      data-unoptimized={unoptimized}
      data-loading={loading}
      data-fetch-priority={fetchPriority}
    />
  ),
}))

const contact: Contact = {
  id: 1,
  firstName: "Ada",
  lastName: "Lovelace",
  photo: "Unsplash Jessica Christian.png",
  phoneNumber: "555-555-5555",
}

describe("contact card photo and heading", () => {
  it("renders an immutable avatar without runtime transformation", () => {
    render(<ContactCardPhotoAndHeading contact={contact} />)

    const image = screen.getByRole("img", { name: "Ada Lovelace" })

    expect(image.getAttribute("data-src")).toContain("jessica-christian")
    expect(image).toHaveAttribute("data-unoptimized", "true")
    expect(image).toHaveAttribute("data-loading", "lazy")
    expect(image).toHaveAttribute("data-fetch-priority", "low")
    expect(
      screen.queryByRole("button", {
        name: "Reorder Ada Lovelace by dragging",
      }),
    ).not.toBeInTheDocument()
  })

  it("renders the avatar fallback when no photo is available", () => {
    const { rerender } = render(
      <ContactCardPhotoAndHeading contact={{ ...contact, photo: undefined }} />,
    )

    expect(screen.queryByRole("img")).not.toBeInTheDocument()

    rerender(
      <ContactCardPhotoAndHeading
        contact={{ ...contact, photo: "Unknown portrait.png" }}
      />,
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
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute(
      "data-fetch-priority",
      "high",
    )
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toHaveAttribute(
      "data-loading",
      "eager",
    )
  })
})
