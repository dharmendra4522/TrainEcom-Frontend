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

// charts dummy data
export const userChartData = {
  labels: ['Customers'],
  datasets: [
    {
      data: [15],
      backgroundColor: ['#0dee0d']
    }
  ]
};

export const categoryProductData = {
  labels: [
    'Electronics',
    'Clothing',
    'Groceries',
    'Home Appliances',
    'Books',
    'Toys',
    'Sports',
    'Beauty',
    'Automotive',
    'Jewelry'
  ],
  datasets: [
    {
      data: [45, 30, 60, 25, 15, 20, 10, 5, 8, 12],
      backgroundColor: '#3f51b5',
      maxBarThickness: 25
    }
  ]
};

export const revenueChartData = {
  labels: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ],
  datasets: [
    {
      data: [
        20000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000,
        38000, 40000,
      ],
      backgroundColor: '#4caf50',
      maxBarThickness: 25
    }
  ]
};

export const orderStatusChartData = {
  labels: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ],
  datasets: [
    {
      data: [30, 25, 40, 35, 50, 45, 60, 55, 70, 65, 80, 75],
      label: 'Active',
      backgroundColor: '#2196f3'
    },
    {
      data: [15, 20, 10, 25, 30, 35, 20, 25, 15, 10, 5, 10],
      label: 'Processing',
      backgroundColor: '#ffc107'
    },
    {
      data: [50, 45, 60, 55, 70, 65, 80, 75, 90, 85, 100, 95],
      label: 'Delivered',
      backgroundColor: '#4caf50'
    },
    {
      data: [20, 15, 25, 30, 35, 40, 30, 25, 20, 15, 10, 5],
      label: 'Cancelled',
      backgroundColor: '#f44336'
    }
  ]
};
