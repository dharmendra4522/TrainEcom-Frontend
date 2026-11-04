import {
  DashboardData,
  DashboardStatItem
} from '../../../../core/models/dashboard.model';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { getOrderStatusClass as getOrderStatusBadgeClass, getPaymentStatusClass as getPaymentStatusBadgeClass } from '../../../../shared/utils/status-badge.utils';
export const INITIAL_ADMIN_STATS: DashboardStatItem[] = [
  { title: 'Products', value: '0', icon: 'inventory_2', color: '#f44336' }
];

export { getOrderStatusBadgeClass, getPaymentStatusBadgeClass };

export function buildDashboardStats(
  data: DashboardData,
  portalRoutes: PortalRouteService,
  portal: PortalKey
): DashboardStatItem[] {
  return [
    {
      title: 'Products',
      value: data.totalProducts.toString(),
      icon: 'inventory_2',
      color: '#f44336',
      route: portalRoutes.products(portal, 'manage')
    }
  ];
}
