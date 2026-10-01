import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { normalizeApprovalStatus } from '../utils/role.utils';
import { ApprovalStatus } from '../models/user.model';

export const vendorApprovedGuard: CanActivateFn = () => {
  const router = inject(Router);

  const vendorStatus = localStorage.getItem('vendorStatus');
  const normalizedStatus = normalizeApprovalStatus(vendorStatus);

  if (normalizedStatus !== ApprovalStatus.Approved) {
    router.navigate(['/vendor/dashboard']);
    return false;
  }
  
  return true;
};
