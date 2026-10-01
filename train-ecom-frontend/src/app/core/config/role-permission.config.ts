import { Role } from '../models/auth.model';
import { ApprovalStatus } from '../models/user.model';
import { normalizeApprovalStatus } from '../utils/role.utils';

export interface MenuItemConfig {
  key: string;
  label: string;
  icon: string;
  route: string;
  allowedRoles: Role[];
  allowInPendingState?: boolean;
}

export const ALL_MENU_ITEMS: MenuItemConfig[] = [
  {
    key: 'vendor-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/vendor/dashboard',
    allowedRoles: [Role.Vendor],
    allowInPendingState: true,
  },
  {
    key: 'vendor-products',
    label: 'Products',
    icon: 'inventory_2',
    route: '/vendor/products',
    allowedRoles: [Role.Vendor],
    allowInPendingState: false,
  },
  {
    key: 'vendor-orders',
    label: 'Orders',
    icon: 'shopping_cart',
    route: '/vendor/orders',
    allowedRoles: [Role.Vendor],
    allowInPendingState: false,
  },
  {
    key: 'vendor-profile',
    label: 'Profile',
    icon: 'person',
    route: '/vendor/profile',
    allowedRoles: [Role.Vendor],
    allowInPendingState: true,
  },

  // Admin menu
  {
    key: 'admin-dashboard',
    label: 'Dashboard',
    icon: 'dashboard',
    route: '/admin/dashboard',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-products',
    label: 'Products',
    icon: 'inventory_2',
    route: '/admin/products',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-brands',
    label: 'Brands',
    icon: 'branding_watermark',
    route: '/admin/brands',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-categories',
    label: 'Categories',
    icon: 'category',
    route: '/admin/categories',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-users',
    label: 'Manage Users',
    icon: 'people',
    route: '/admin/users',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-orders',
    label: 'Manage Orders',
    icon: 'shopping_cart',
    route: '/admin/orders',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-profile',
    label: 'Profile',
    icon: 'person',
    route: '/admin/profile',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },
  {
    key: 'admin-analytics',
    label: 'Platform Analytics',
    icon: 'bar_chart',
    route: '/admin/reports',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },

  {
    key: 'admin-notifications',
    label: 'Notifications',
    icon: 'notifications',
    route: '/admin/notifications-history',
    allowedRoles: [Role.Admin],
    allowInPendingState: false,
  },

  // Customer menu
  {
    key: 'customer-profile',
    label: 'My Profile',
    icon: 'person',
    route: '/account/profile',
    allowedRoles: [Role.Customer],
    allowInPendingState: false,
  },

  {
    key: 'customer-address',
    label: 'My Address',
    icon: 'location_on',
    route: '/account/address',
    allowedRoles: [Role.Customer],
    allowInPendingState: false,
  },

  {
    key: 'customer-orders',
    label: 'My Orders',
    icon: 'shopping_bag',
    route: '/account/orders',
    allowedRoles: [Role.Customer],
    allowInPendingState: false,
  },
  {
    key: 'customer-wishlist',
    label: 'My Wishlists',
    icon: 'favorite',
    route: '/account/wishlist',
    allowedRoles: [Role.Customer],
    allowInPendingState: false,
  },

  {
    key: 'customer-cart',
    label: 'My Cart',
    icon: 'shopping_cart',
    route: '/account/cart',
    allowedRoles: [Role.Customer],
    allowInPendingState: false,
  },
  {
    key: 'customer-notification',
    label: 'My Notifications',
    icon: 'notifications',
    route: '/account/notifications-history',
    allowedRoles: [Role.Customer],
    allowInPendingState: false,
  },
];

export function getRoleMenuItems(
  role: Role | null,
  vendorStatus: string | number | ApprovalStatus | null,
): { label: string; icon: string; route: string; disabled: boolean }[] {
  if (!role) return [];

  const status = normalizeApprovalStatus(vendorStatus);

  const isApprovedVendor = role === Role.Vendor && status === ApprovalStatus.Approved;
  const isPendingVendor = role === Role.Vendor && status === ApprovalStatus.Pending;

  return ALL_MENU_ITEMS.filter((item) => item.allowedRoles.includes(role)).map(
    (item) => {
      let isDisabled = false;
      if (role === Role.Vendor) {
        if (isPendingVendor) {
          isDisabled = !item.allowInPendingState;
        } else if (isApprovedVendor) {
          isDisabled = false;
        } else {
          isDisabled = false;
        }
      }
      return {
        label: item.label,
        icon: item.icon,
        route: item.route,
        disabled: isDisabled,
      };
    },
  );
}

