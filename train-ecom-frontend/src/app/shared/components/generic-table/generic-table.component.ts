import { Component, Input, Output, EventEmitter } from '@angular/core';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
} from '../../../core/models/table.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.css',
})
export class GenericTableComponent {
  @Input() isLoading: boolean = false;
  @Input() data: Record<string, unknown>[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() showInlineActions: boolean = false;
  @Input() showIndex: boolean = true;
  @Input() emptyMessage: string = 'No records found.';

  @Input() showPaginator: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 5;
  @Input() pageIndex: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];

  @Output() actionClick = new EventEmitter<TableActionEvent>();

  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() rowClick = new EventEmitter<Record<string, unknown>>();

  // get displayed columns for the table safely
  get displayedColumns(): string[] {
    const cols: string[] = [];
    if (this.showIndex) {
      cols.push('sno');
    }
    if (this.columns) {
      this.columns.forEach((c) => {
        if (c && c.key && !cols.includes(c.key)) {
          cols.push(c.key);
        }
      });
    }
    if (this.actions && this.actions.length > 0 && !cols.includes('actions')) {
      cols.push('actions');
    }
    return cols;
  }

  onActionClick(actionKey: string, row: Record<string, unknown>): void {
    this.actionClick.emit({ action: actionKey, row });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }

  onRowClick(row: Record<string, unknown>, event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.closest('.action-btn')) {
      return;
    }
    this.rowClick.emit(row);
  }

  getActionColor(act: TableAction, row: any): 'primary' | 'accent' | 'warn' | undefined | null {
    const color = typeof act.color === 'function' ? act.color(row) : act.color;
    return color as 'primary' | 'accent' | 'warn' | undefined | null;
  }

  getActionIcon(act: TableAction, row: any): string {
    return typeof act.icon === 'function' ? act.icon(row) : act.icon;
  }

  getActionLabel(act: TableAction, row: any): string {
    if (act.label) {
      return typeof act.label === 'function' ? act.label(row) : act.label;
    }
    return act.tooltip || act.actionKey;
  }
}
