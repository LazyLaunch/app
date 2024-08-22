export const GOOGLE_SCOPES = ['openid', 'profile', 'email'] as const
export type GoogleOAuthScope = (typeof GOOGLE_SCOPES)[number]

export enum ProviderTypeEnum {
  Oidc = 'oidc',
  Oauth = 'oauth',
  Email = 'email',
  Credentials = 'credentials',
}

export enum OauthKeyNameEnum {
  GoogleOauthState = 'google_oauth_state',
  GoogleOauthCodeVerifier = 'google_oauth_code_verifier',
  GoogleOauthFlow = 'google_oauth_flow',
}

export type ProviderType = `${ProviderTypeEnum}`
export type OauthKeyName = `${OauthKeyNameEnum}`

export enum UserFlow {
  Signup = 'signup',
  Login = 'login',
}

export enum UserErrorFlowEnum {
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_NOT_FOUND = 'not_found',
  ACCOUNT_ALREADY_EXISTS = 'already_exists',
  INVALID_FLOW = 'invalid_flow',
}
