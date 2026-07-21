import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumn, TableAction, TableActionEvent } from '../../../core/models/table.model';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrl: './generic-table.component.css'
})
export class GenericTableComponent {



  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];
  @Input() actions: TableAction[] = [];
  @Input() showIndex: boolean = true;
  @Input() emptyMessage: string = 'No records found.';

  @Input() showPaginator: boolean = false;
  @Input() totalRecords: number = 0;
  @Input() pageSize: number = 10;
  @Input() pageIndex: number = 0;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];


  @Output() actionClick = new EventEmitter<TableActionEvent<any>>();

  @Output() pageChange = new EventEmitter<PageEvent>();

  get displayedColumns(): string[] {
    const cols: string[] = [];
    if (this.showIndex) {
      cols.push('sno');
    }
    if (this.columns) {
      cols.push(...this.columns.map(c => c.key));
    }
    if (this.actions && this.actions.length > 0) {
      cols.push('actions');
    }
    return cols;
  }

  onActionClick(actionKey: string, row: any): void {
    this.actionClick.emit({ action: actionKey, row });
  }

  onPageChange(event: PageEvent): void {
    this.pageChange.emit(event);
  }
}
