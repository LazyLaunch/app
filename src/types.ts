export const GOOGLE_SCOPES = ['openid', 'profile', 'email'] as const
export const CSRF_TOKEN = 'csrfToken' as const

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

export enum UserFlowEnum {
  Signup = 'signup',
  Login = 'login',
}

export enum UserErrorFlowEnum {
  EMAIL_NOT_VERIFIED = 'email_not_verified',
  ACCOUNT_NOT_FOUND = 'not_found',
  ACCOUNT_ALREADY_EXISTS = 'already_exists',
  INVALID_FLOW = 'invalid_flow',
}

export enum ResponseStatusEnum {
  Success = 'success',
  Error = 'error',
}

export enum ResponseCodeEnum {
  Success = 200,
  Error = 400,
}

export enum FormActionEnum {
  Post = 'POST',
  Put = 'PUT',
}
export type FormAction = `${FormActionEnum}`
