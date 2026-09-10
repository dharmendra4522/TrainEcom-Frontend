import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
} from '../../../core/models/table.model';
import { PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';

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

  @Output() sortChnage = new EventEmitter<Sort>();

  @ViewChild(MatSort) sort!: MatSort;

  originalData: Record<string, unknown>[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.originalData = [...this.data];
    }
  }

  onSortData(sort: Sort): void {
    if (!sort.active || sort.direction === '') {
      this.data = [...this.originalData];
      return;
    }

    const isAsc = sort.direction === 'asc';

    const activeColumn = this.columns.find((col) => col.key === sort.active);

    const columnType = activeColumn?.type || 'text';
    const copyData = [...this.originalData];

    this.data = copyData.sort((a, b) => {
      let valueA = a[sort.active];
      let valueB = b[sort.active];
      if (columnType === 'number') {
        valueA = Number(valueA);
        valueB = Number(valueB);
      } else if (columnType === 'string') {
        valueA = String(valueA);
        valueB = String(valueB);
      }
      return this.compareData(
        valueA as string | number,
        valueB as string | number,
        isAsc,
      );
    });
  }

  private compareData(
    a: number | string | boolean,
    b: number | string | boolean,
    isAsc: boolean,
  ): number {
    if (isAsc === true) {
      if (a < b) {
        return -1;
      } else {
        return 1;
      }
    } else {
      if (a > b) {
        return 1;
      } else {
        return -1;
      }
    }
  }

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

  getActionColor(
    act: TableAction,
    row: Record<string, unknown>,
  ): 'primary' | 'accent' | 'warn' | undefined | null {
    const color = typeof act.color === 'function' ? act.color(row) : act.color;
    return color as 'primary' | 'accent' | 'warn' | undefined | null;
  }

  getActionIcon(act: TableAction, row: Record<string, unknown>): string {
    return typeof act.icon === 'function' ? act.icon(row) : act.icon;
  }

  getActionLabel(act: TableAction, row: Record<string, unknown>): string {
    if (act.label) {
      return typeof act.label === 'function' ? act.label(row) : act.label;
    }
    return act.tooltip || act.actionKey;
  }
}
