import { DashboardData, DashboardStatItem } from '../../../../core/models/dashboard.model';


export const INITIAL_ADMIN_STATS: DashboardStatItem[] = [
  { title: 'Total Revenue', value: '₹...', icon: 'attach_money', color: '#4caf50' },
  { title: 'Orders', value: '...', icon: 'shopping_cart', color: '#2196f3' },
  { title: 'Customers', value: '...', icon: 'people', color: '#ff9800' },
  { title: 'Products', value: '...', icon: 'inventory_2', color: '#f44336' },
  { title: 'Brands', value: '...', icon: 'branding_watermark', color: '#9c27b0' },
  { title: 'Categories', value: '...', icon: 'category', color: '#3f51b5' },
];


export function buildDashboardStats(data: DashboardData): DashboardStatItem[] {
  return [
    { title: 'Total Revenue', value: `₹${data.totalRevenue}`, icon: 'attach_money', color: '#4caf50' },
    { title: 'Orders', value: data.totalOrders.toString(), icon: 'shopping_cart', color: '#2196f3' },
    { title: 'Customers', value: data.totalUsers.toString(), icon: 'people', color: '#ff9800' },
    { title: 'Products', value: data.totalProducts.toString(), icon: 'inventory_2', color: '#f44336' },
    { title: 'Brands', value: data.totalBrands.toString(), icon: 'branding_watermark', color: '#9c27b0' },
    { title: 'Categories', value: data.totalCategories.toString(), icon: 'category', color: '#3f51b5' },
  ];
}

export function getOrderStatusBadgeClass(orderStatus: string): string {
  switch (orderStatus?.toLowerCase()) {
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