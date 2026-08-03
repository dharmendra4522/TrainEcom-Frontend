export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'badge' | 'currency' | 'date';
  truncate?: boolean;
  badgeClassKey?: string;
}

export interface TableAction {
  actionKey: 'edit' | 'delete' | 'view';
  icon: string;
  color: 'primary' | 'warn' | 'accent';
  tooltip?: string;
}

export interface TableActionEvent<T = unknown> {
  action: string;
  row: T;
}


export interface BreadcrumbItem {
  label: string;
  url?: string;
} 