import type { FormValues, SelectItem } from '@/components/card-form'
import { CardForm } from '@/components/card-form'
import { useState } from 'react'

export interface Email {
  name: string
  verified: boolean
  primary: boolean
}

interface Props {
  csrfToken: string
  user: {
    name: string
    username: string
    email: string
  }
  initSelectItems: SelectItem[]
  emails: Email[]
}

export function UserSettingsContainer({ initSelectItems, csrfToken, user, emails }: Props) {
  const [selectItems, setSelectItems] = useState(initSelectItems)

  function handleCallback(values: FormValues) {
    const newSelectItems: SelectItem[] = emails.map((email): SelectItem => {
      const badges = []
      const isPrimary = email.name === values.email
      const isVerified = Boolean(email.verified)

      if (isPrimary) badges.push({ text: 'Primary', type: 'primary' })
      if (isVerified) badges.push({ text: 'Verified', type: 'primary' })
      if (!isVerified) badges.push({ text: 'Unverified', type: 'secondary' })

      return {
        val: email.name!,
        text: email.name!,
        disabled: !isVerified,
        badges,
      }
    })
    setSelectItems(newSelectItems)
  }

  return (
    <>
      <CardForm
        inputName="name"
        inputVal={user.name}
        csrfToken={csrfToken}
        title="Display Name"
        label="This is your public display name. It can be your real name or a pseudonym."
        footerTitle="Please use 32 characters at maximum."
        successMsg="Your display name has been updated."
        validationRules={{ required: 'Name is required.' }}
        actionsPath="user.update"
      />

      <CardForm
        className="mt-9"
        inputName="username"
        inputVal={user.username}
        csrfToken={csrfToken}
        title="Username"
        label="This is your URL namespace within the site."
        footerTitle="Please use 48 characters at maximum."
        successMsg="Your username has been updated."
        validationRules={{ required: 'Username is required.' }}
        actionsPath="user.update"
      />

      <CardForm
        className="mt-9"
        inputName="email"
        inputVal={user.email}
        csrfToken={csrfToken}
        inputType="email"
        fieldType="select"
        title="Email address"
        label="Emails must be verified to be able to login with them or be used as primary email."
        footerTitle="You can manage verified email addresses in your <a href='/account/email-settings' class='underline'>email settings</a>."
        selectItems={selectItems}
        successMsg="Your email address has been updated."
        validationRules={{ required: 'Email address is required.' }}
        handleCallback={handleCallback}
        actionsPath="user.update"
      />
    </>
  )
}
