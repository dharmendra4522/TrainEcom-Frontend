import { OrderStatus } from "./checkout.model";

export interface RecentOrder {
  orderId: number;
  customerName: string;
  totalPrice: number;
  orderStatus: OrderStatus;
  orderDate: string;
}

export interface DashboardData {
  totalProducts: number;
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  cancelOrders: number;
  shippedOrders: number;
  totalUsers: number;
  totalCustomers: number;
  totalVendors: number;
  totalAdminUsers: number;
  totalStaffUsers?: number;
  recentOrders: RecentOrder[];
}

export interface DashboardStatItem {
  title: string;
  value: string;
  icon: string;
  color: string;
  route?: (string | number)[];
}

export type DashboardOrderRow = {
  [key: string]: unknown;
  orderId: number;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  orderStatusClass: string;
};

export interface CategorySubCategorySummary {
  subCategoryId: number;
  subCategoryName: string;
  productCount: number;
}

export interface CategoryWiseProductCount {
  categoryId: number;
  categoryName: string;
  productCount: number;
  subCategories: CategorySubCategorySummary[];
}

export interface CategoryProductSummaryResponse {
  totalCategories: number;
  summary: CategoryWiseProductCount[];
}

export interface MonthlyRevenue {
  month: number;
  monthName: string;
  revenue: number;
}

export interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: MonthlyRevenue[];
}

export interface VendorItem {
  vendorId: number;
  vendorName: string;
}

export interface MonthlyOrderData {
  month: number;
  monthName: string;
  activeOrders: number;
  deliveredOrders: number;
  cancelOrders: number;
  shippedOrders: number;
}

export interface OrderSummaryResponse {
  totalOrders: number;
  monthlyData: MonthlyOrderData[];
}
