import { AdminUser } from '../models/user.model';
export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'badge' | 'currency' | 'date' | number | string;
  truncate?: boolean;
  badgeClassKey?: string;
}

export interface TableAction {
  actionKey: string;
  icon: string | ((row: AdminUser) => string);
  color: 'primary' | 'warn' | 'accent' | ((row: AdminUser) => any);
  tooltip?: string;
  label?: string | ((row: AdminUser) => string);
}
export interface TableActionEvent<T = unknown> {
  action: string;
  row: T;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
}
