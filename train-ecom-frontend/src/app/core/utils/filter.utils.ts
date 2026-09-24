import { UserStatusFilter } from '../models/user.model';

export function normalizeUserStatus(
  status: UserStatusFilter | boolean | string | number | undefined,
): number | undefined {
  if (status === undefined || status === null || status === '' || status === 'All') {
    return undefined;
  }
  if (typeof status === 'number') {
    return status === UserStatusFilter.All ? undefined : status;
  }
  if (typeof status === 'boolean') {
    return status ? UserStatusFilter.Blocked : UserStatusFilter.Active;
  }
  
  const value = String(status).trim().toLowerCase();
  if (value === 'all' || value === '1') return undefined;
  if (value === 'active' || value === 'false' || value === '2') return UserStatusFilter.Active;
  if (value === 'blocked' || value === 'true' || value === '3') return UserStatusFilter.Blocked;
  
  const num = Number(status);
  return !isNaN(num) && num !== UserStatusFilter.All ? num : undefined;
}