import { useState } from 'react'

import { EmailFormComponent } from '@/components/account/settings/email-form-component'
import { EmailRowComponent } from '@/components/account/settings/email-row-component'

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'

export interface EmailProps {
  name: string
  verified: boolean
  primary: boolean
}

interface Props {
  csrfToken: string
  initialEmails: EmailProps[]
}

export function EmailSettingsContainer({ csrfToken, initialEmails }: Props) {
  const [emails, setEmails] = useState(initialEmails)

  const addEmail = (newEmail: string) => {
    setEmails((prevEmails) => [...prevEmails, { name: newEmail, verified: false, primary: false }])
  }

  const deleteEmail = (emailToRemove: string) => {
    setEmails((prevEmails) => prevEmails.filter((email) => email.name !== emailToRemove))
  }

  const setPrimaryEmail = (newEmail: string) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => ({ ...email, primary: email.name === newEmail }))
    )
  }

  return (
    <div>
      <EmailFormComponent csrfToken={csrfToken} addEmail={addEmail} />
      <Card className="mt-6">
        <CardHeader className="pb-4">
          <CardTitle className="pb-3 text-xl font-semibold tracking-tight">List</CardTitle>
          <CardDescription className="font-normal leading-none text-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            Your primary email will be used for account-related notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <ul className="divide-y rounded-md border">
            {emails.map((email, index) => (
              <li key={`${email}-${index}`}>
                <EmailRowComponent
                  deleteEmail={deleteEmail}
                  csrfToken={csrfToken}
                  email={email}
                  setPrimaryEmail={setPrimaryEmail}
                />
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter className="border-t bg-muted py-5 text-sm text-muted-foreground">
          Emails must be verified to be able to login with them or be used as primary email.
        </CardFooter>
      </Card>
    </div>
  )
}
