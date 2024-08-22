import { sha256, generateRandomString, alphabet } from 'oslo/crypto'

interface CreateCSRFTokenParams {
  cookieValue?: string
  bodyValue?: string | null
}

interface CSRFToken {
  cookie: string
  csrfToken: string
  csrfTokenVerified: boolean
}

const SECRET = import.meta.env.CSRF_SALT

export async function createCSRFToken({
  cookieValue,
  bodyValue,
}: CreateCSRFTokenParams): Promise<CSRFToken> {
  if (cookieValue) {
    const [csrfToken, csrfTokenHash] = cookieValue.split('|')

    const expectedCsrfTokenHash = await createHash(`${csrfToken}${SECRET}`)

    if (csrfTokenHash === expectedCsrfTokenHash) {
      const csrfTokenVerified = csrfToken === bodyValue

      return { csrfTokenVerified, csrfToken, cookie: '' }
    }
  }

  const csrfToken = randomString(32)
  const csrfTokenHash = await createHash(`${csrfToken}${SECRET}`)
  const cookie = `${csrfToken}|${csrfTokenHash}`

  return { cookie, csrfToken, csrfTokenVerified: false }
}

async function createHash(message: string) {
  const data = new TextEncoder().encode(message)
  const hash = await sha256(data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toString()
}

function randomString(size: number) {
  return generateRandomString(size, alphabet('a-z', '0-9'))
}
