export enum UserRolesEnum {
  OWNER = 'owner',
  MEMBER = 'member',
}
export type UserRoles = `${UserRolesEnum}`

export enum UserPermissionsEnum {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
}

export const ROLES = {
  [UserRolesEnum.OWNER]: [
    UserPermissionsEnum.CREATE,
    UserPermissionsEnum.READ,
    UserPermissionsEnum.UPDATE,
    UserPermissionsEnum.DELETE,
    UserPermissionsEnum.LIST,
  ],
  [UserRolesEnum.MEMBER]: [
    UserPermissionsEnum.CREATE,
    UserPermissionsEnum.READ,
    UserPermissionsEnum.UPDATE,
    UserPermissionsEnum.DELETE,
    UserPermissionsEnum.LIST,
  ],
} as const

export function hasPermission(
  userRole: UserRoles,
  requiredPermission: UserPermissionsEnum
): boolean {
  return ROLES[userRole].includes(requiredPermission)
}
