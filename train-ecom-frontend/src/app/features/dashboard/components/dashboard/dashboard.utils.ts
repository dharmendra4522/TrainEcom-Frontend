import {
  DashboardData,
  DashboardStatItem,
} from '../../../../core/models/dashboard.model';
import { OrderStatus } from '../../../../core/models/order.model';
import { PortalRouteService } from '../../../../core/services/portal-route.service';
import { PortalKey } from '../../../../core/config/management-access.config';
import { normalizeOrderStatus } from '../../../../core/utils/role.utils';

export const INITIAL_ADMIN_STATS: DashboardStatItem[] = [
  {
    title: 'Revenue',
    value: '₹...',
    icon: 'currency_rupee',
    color: '#4caf50',
  },
  { title: 'Orders', value: '...', icon: 'shopping_cart', color: '#2196f3' },
  { title: 'Customers', value: '...', icon: 'people', color: '#ff9800' },
  { title: 'Products', value: '...', icon: 'inventory_2', color: '#f44336' },
  // {
  //   title: 'Brands',
  //   value: '...',
  //   icon: 'branding_watermark',
  //   color: '#9c27b0',
  // },
  // { title: 'Categories', value: '...', icon: 'category', color: '#3f51b5' },
];

export function buildDashboardStats(
  data: DashboardData,
  portalRoutes: PortalRouteService,
  portal: PortalKey
): DashboardStatItem[] {
  return [
    {
      title: 'Total Revenue',
      value: `₹${data.totalRevenue}`,
      icon: 'currency_rupee',
      color: '#4caf50',
    },
    {
      title: 'Orders',
      value: data.totalOrders.toString(),
      icon: 'shopping_cart',
      color: '#2196f3',
      route: portalRoutes.orders(portal, 'manage'),
    },
    {
      title: 'Customers',
      value: data.totalUsers.toString(),
      icon: 'people',
      color: '#ff9800',
      route: portalRoutes.orders(portal, 'manage'),
    },
    {
      title: 'Products',
      value: data.totalProducts.toString(),
      icon: 'inventory_2',
      color: '#f44336',
      route: portalRoutes.products(portal, 'manage'),
    },
    // {
    //   title: 'Brands',
    //   value: data.totalBrands.toString(),
    //   icon: 'branding_watermark',
    //   color: '#9c27b0',
    //   route: portalRoutes.brands(portal),
    // },
    // {
    //   title: 'Categories',
    //   value: data.totalCategories.toString(),
    //   icon: 'category',
    //   color: '#3f51b5',
    //   route: portalRoutes.brands(portal),
    // },
  ];
}

export function getOrderStatusBadgeClass(orderStatus: OrderStatus | number | string): string {
  const statusLabel = normalizeOrderStatus(orderStatus);
  switch (statusLabel?.toLowerCase()) {
    case 'confirmed':
      return 'bg-primary-subtle text-primary border border-primary-subtle';
    case 'processing':
      return 'bg-warning-subtle text-warning border border-warning-subtle';
    case 'shipped':
      return 'bg-info-subtle text-info border border-info-subtle';
    case 'delivered':
      return 'bg-success-subtle text-success border border-success-subtle';
    case 'cancelled':
      return 'bg-danger-subtle text-danger border border-danger-subtle';
    default:
      return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
  }
}

export function getPaymentStatusBadgeClass(paymentStatus: string): string {
  switch (paymentStatus?.toLowerCase()) {
    case 'success':
    case 'paid':
      return 'bg-success-subtle text-success border border-success-subtle';
    case 'failed':
      return 'bg-danger-subtle text-danger border border-danger-subtle';
    case 'pending':
    default:
      return 'bg-warning-subtle text-warning border border-warning-subtle';
  }
}


// charts dummy data
export const userChartData = {
  labels: ['Vendors', 'Customers'],
  datasets:[
   {
      data: [ 15, 120],
      backgroundColor: ['#2196f3', '#ff9800'], 
    }]
}

export const brandProductData = {
  labels: ['Adidas', 'Apple', 'Dell', 'HP', 'LG'], 
  datasets: [
    {
      data: [12, 18, 15, 10, 20], 
      label: 'Products by Brand', 
      backgroundColor: '#9c27b0',
    }
  ],
}

export const categoryProductData ={
  labels: ['Electronics', 'Clothing', 'Groceries', 'Home Appliances'], 
  datasets: [
    {
      data: [45, 30, 60, 25], 
      label: 'Products by Category', 
      backgroundColor: '#3f51b5',
    },
  ],
}