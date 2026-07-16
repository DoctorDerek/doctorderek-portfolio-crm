export default function ContactCardEmail({ email }: { email: string }) {
  const splitEmail = email.split("@")

  return (
    <div className="flex flex-wrap">
      {splitEmail.length === 2 && (
        <>
          <span>{splitEmail[0]}</span>
          <span>@</span>
          <span>{splitEmail[1]}</span>
        </>
      )}
      {splitEmail.length !== 2 && <span>{email}</span>}
    </div>
  )
}
