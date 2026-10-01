import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { vendorApprovedGuardGuard } from './vendor-approved-guard';

describe('vendorApprovedGuardGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => vendorApprovedGuardGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
