import { AdminUser } from '../models/user.model';
export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'badge' | 'currency' | 'date' | number | string;
  truncate?: boolean;
  badgeClassKey?: string;
}

export interface TableAction<T = unknown> {
  actionKey: string;
  icon: string | ((row: T) => string);
  color: 'primary' | 'warn' | 'accent' | ((row: T) => string);
  tooltip?: string;
  label?: string | ((row: T) => string);
}
export interface TableActionEvent<T = unknown> {
  action: string;
  row: T;
}

export interface BreadcrumbItem {
  label: string;
  url?: string;
}
