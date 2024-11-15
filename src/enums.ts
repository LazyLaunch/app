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

export enum ResponseStatusMessageEnum {
  UNAUTHORIZED = 'User must be logged in.',
}

export enum ResponseStatusEnum {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export enum ResponseCodeEnum {
  SUCCESS = 200,
  ERROR = 400,
  NOT_FOUND = 404,
  UNAUTHORIZED = 401,
}

export enum ContactSourceEnum {
  FORM = 'form',
  API = 'api',
  APP = 'app',
}

export enum CustomFieldTypeEnum {
  STRING = 'string',
  NUMBER = 'number',
  DATE = 'date',
  BOOLEAN = 'boolean',
  ENUM = 'enum',
}

export enum Operator {
  EQUALS = 0,
  NOT_EQUAL = 1,
  CONTAINS = 2,
  NOT_CONTAIN = 3,
  IS_EMPTY = 4,
  IS_NOT_EMPTY = 5,
  IS_TRUE = 6,
  IS_FALSE = 7,
  IS_AFTER = 8,
  IS_BEFORE = 9,
  BETWEEN = 10,
  GREATER_THAN = 11,
  LESS_THAN = 12,
}

export enum ConditionType {
  AND = 0,
  OR = 1,
}
