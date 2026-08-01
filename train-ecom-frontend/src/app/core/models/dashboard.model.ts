export interface RecentOrder {
  orderId: string;
  customerName: string;
  totalPrice: number;
  orderStatus: string;
  orderDate: string;
}

export interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBrands: number;
  totalCategories: number;
  recentOrders: RecentOrder[];
}
