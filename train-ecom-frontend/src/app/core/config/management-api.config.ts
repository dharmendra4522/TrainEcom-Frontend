import { PortalKey } from './management-access.config';

/** Update vendor paths here if the backend uses different endpoint names. */
export const MANAGEMENT_API_PATHS: Record<
  PortalKey,
  {
    products: string;
    orders: { list: string; detail: string; updateStatus: string };
  }
> = {
  admin: {
    products: '/products',
    orders: {
      list: '/admin/orders/all',
      detail: '/admin/orders/getById',
      updateStatus: '/admin/orders',
    },
  },
  vendor: {
    products: '/products',
    orders: {
      list: '/vendor/orders/all',
      detail: '/vendor/orders/getById',
      updateStatus: '/vendor/orders',
    },
  },
};
