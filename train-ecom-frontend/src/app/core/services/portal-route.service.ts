import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { PortalKey, isPortalKey } from '../config/management-access.config';

@Injectable({ providedIn: 'root' })
export class PortalRouteService {
  private router = inject(Router);

  currentPortal(url = this.router.url): PortalKey | null {
    const firstSegment = url.split('?')[0].split('/').filter(Boolean)[0];
    return isPortalKey(firstSegment) ? firstSegment : null;
  }

  products(portal: PortalKey, ...segments: (string | number)[]): (string | number)[] {
    return ['/', portal, 'products', ...segments];
  }

  orders(portal: PortalKey, ...segments: (string | number)[]): (string | number)[] {
    return ['/', portal, 'orders', ...segments];
  }

  brands(portal: PortalKey, ...segments: (string | number)[]): (string | number)[] {
    return ['/', portal, 'brands', ...segments];
  }

  categories(portal: PortalKey, ...segments: (string | number)[]): (string | number)[] {
    return ['/', portal, 'categories', ...segments];
  }

  users(portal: PortalKey, ...segment:(string | number)[]): (string | number)[] {
    return ['/', portal, 'users', ...segment]
  }

  

}
