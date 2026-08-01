export interface DashboardStats extends Record<string, unknown> {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalBrands: number;
  totalCategories: number;
  recentOrders: any[];
}

