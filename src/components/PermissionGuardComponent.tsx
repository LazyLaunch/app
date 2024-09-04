import { hasPermission, UserPermissionsEnum, type UserRoles } from '@/lib/rbac'

interface Props {
  role: UserRoles
  permission: UserPermissionsEnum
  children: any
}

export function PermissionGuardComponent({ children, role, permission }: Props) {
  const canAccess = hasPermission(role, permission)
  return canAccess && children
}
