/// <reference path="../.astro/types.d.ts" />
/// <reference types="lucia" />
declare namespace Lucia {
  type Auth = import('./lib/auth.ts').Auth
  type DatabaseUserAttributes = {}
  type DatabaseSessionAttributes = {}
}

declare namespace App {
  interface Locals {
    session: import('lucia').Session | null
    user: import('lucia').User | null
  }
}

interface ImportMetaEnv {
  readonly TURSO_CONNECTION_URL: string
  readonly TURSO_AUTH_TOKEN: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
