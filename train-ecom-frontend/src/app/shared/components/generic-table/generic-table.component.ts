import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableColumn, TableAction, TableActionEvent } from '../../../core/models/table.model';

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

  @Output() actionClick = new EventEmitter<TableActionEvent<any>>();

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
}
