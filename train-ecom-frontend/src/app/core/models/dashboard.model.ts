import { OrderStatus } from "./checkout.model";

export interface RecentOrder {
  orderId: string;
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
  orderId: string;
  customerName: string;
  orderDate: string;
  totalAmount: number;
  orderStatus: string;
  orderStatusClass: string;
};


export interface CategoryWiseProductCount {
  categoryId: number;
  categoryName: string;
  productCount: number;
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