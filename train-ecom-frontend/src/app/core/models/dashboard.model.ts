import { OrderStatus } from "./checkout.model";

export interface RecentOrder {
  orderId: string;
  customerName: string;
  totalPrice: number;
  orderStatus: OrderStatus;
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