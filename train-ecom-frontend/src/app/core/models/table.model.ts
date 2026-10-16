import { Role } from './auth.model';
export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'badge' | 'currency' | 'date' | number | string;
  truncate?: boolean;
  sortable?: boolean;
  role?: Role;
  badgeClassKey?: string;
  filterable?: boolean;
  filterType?: 'dropdown' | 'search'| 'date' | 'price-range' | 'stock-range';
  filterDisabled?: boolean;
  clickable?: boolean;
}

export interface TableAction<T = unknown> {
  actionKey: string;
  icon: string | ((row: T) => string);
  color: 'primary' | 'warn' | 'accent' | 'info' | ((row: T) => string);
  disabled?: boolean | ((row: T) => boolean);
  hideWhenDisabled?: boolean;
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

export interface DropdownOptions {
  id: string | number;
  label: string;
}

export interface FilterEventPayload {
  key: string;
  value: string;
}