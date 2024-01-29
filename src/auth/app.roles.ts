import { RolesBuilder } from 'nest-access-control';

export const AppRoles = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

export const RBAC_POLICY: RolesBuilder = new RolesBuilder();

RBAC_POLICY
  // user
  .grant(AppRoles.USER)
  .readOwn(['transactions', 'users', 'wallets'])
  .createOwn(['transactions', 'users', 'wallets'])
  .update(['transactions', 'users', 'wallets', 'auth'])
  // admin
  .grant(AppRoles.ADMIN)
  .readAny(['transactions', 'users', 'wallets'])
  .extend(AppRoles.USER)
  .lock();
