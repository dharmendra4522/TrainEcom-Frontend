import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';


export const vendorApprovedGuard: CanActivateFn = () => {
  const router = inject(Router);

  const vendorStatus = localStorage.getItem('vendorStatus') || 'Pending';

  if (vendorStatus.toLowerCase() === 'pending') {
    router.navigate(['/vendor/dashboard']);
    return false;
  }
  return true;
};
