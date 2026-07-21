export interface TableColumn {
  key: string;
  label: string;
  type?: 'text' | 'image' | 'badge' | 'currency';
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
