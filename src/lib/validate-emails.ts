export function validateEmails(emails: string): { isValid: boolean; invalidEmails: string[] } {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
  const emailList = emails.split(',').map((email) => email.trim())
  const invalidEmails: string[] = []

  emailList.forEach((email) => {
    if (!emailPattern.test(email) || email.length > 256) {
      invalidEmails.push(email)
    }
  })

  return {
    isValid: invalidEmails.length === 0,
    invalidEmails,
  }
}
