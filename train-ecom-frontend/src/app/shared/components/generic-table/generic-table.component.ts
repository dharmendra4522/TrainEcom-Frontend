import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  SimpleChanges,
  OnChanges,
  EmbeddedViewRef,
  HostListener
} from '@angular/core';
import {
  TableColumn,
  TableAction,
  TableActionEvent,
  DropdownOptions
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
  @Input() enableRowClick: boolean = true;
  @Input() showheaderFilter: boolean = false;

  // inputs for dropdown state
  @Input() dropdownOptionsMap: Record<string, DropdownOptions[]> = {};
  @Input() dropdownLoadingMap: Record<string, boolean> = {};
  @Input() selectedFiltersMap: Record<string, (string | number)[]> = {};

  // Outputs for dropdown actions
  @Output() dropdownSearchChange = new EventEmitter<{ columnKey: string; searchTerm: string }>();
  @Output() dropdownSelectionChange = new EventEmitter<{ columnKey: string; option: DropdownOptions }>();
  @Output() dropdownScrolled = new EventEmitter<string>();

  @Output() actionClick = new EventEmitter<TableActionEvent>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() rowClick = new EventEmitter<Record<string, unknown>>();
  @Output() sortChange = new EventEmitter<Sort>();
  @ViewChild(MatSort) sort!: MatSort;

  // for scroll-based lazy loading
  @Output() loadMore = new EventEmitter<void>();
  @Input() hasMoreData: boolean = true;

  // events for header filters
  @Output() filterSearch = new EventEmitter<{ columnKey: string, searchTerm: string }>();
  @Output() dropdownOpened = new EventEmitter<string>();
  @Output() loadMoreOptions = new EventEmitter<string>();
  @Output() filterApply = new EventEmitter<{ columnKey: string }>();
  @Output() filterClear = new EventEmitter<string>();

  originalData: Record<string, unknown>[] = [];
  filterValues: Record<string, string> = {};
  activeDropdownCol: string | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && this.data) {
      this.originalData = this.data.map((row, index) => ({
        ...row,
        sno: index + 1,
      }));

      this.data = [...this.originalData];
    }
  }

  onSortData(sort: Sort): void {
    this.sortChange.emit(sort);

    if (!sort.active || !sort.direction) {
      this.data = [...this.originalData];
      return;
    }

    if (sort.active === 'sno') {
      this.data =
        sort.direction === 'asc'
          ? [...this.originalData]
          : [...this.originalData].reverse();

      return;
    }

    const column = this.columns.find((item) => item.key === sort.active);

    // actions, or unknown column sorting avoid
    if (!column || column.sortable === false) {
      return;
    }

    const direction = sort.direction === 'asc' ? 1 : -1;

    this.data = [...this.originalData].sort((rowA, rowB) => {
      const valueA = rowA[sort.active];
      const valueB = rowB[sort.active];

      return this.compareValues(valueA, valueB, column.type) * direction;
    });
  }

  private compareValues(
    valueA: unknown,
    valueB: unknown,
    type: TableColumn['type'] = 'text',
  ): number {
    const isEmptyA = valueA === null || valueA === undefined || valueA === '';
    const isEmptyB = valueB === null || valueB === undefined || valueB === '';

    // Empty/null values hamesha last
    if (isEmptyA && isEmptyB) return 0;
    if (isEmptyA) return 1;
    if (isEmptyB) return -1;

    if (type === 'number' || type === 'currency') {
      const numberA = Number(valueA);
      const numberB = Number(valueB);

      const isInvalidA = Number.isNaN(numberA);
      const isInvalidB = Number.isNaN(numberB);

      if (isInvalidA && isInvalidB) return 0;
      if (isInvalidA) return 1;
      if (isInvalidB) return -1;

      return numberA - numberB;
    }

    if (type === 'date') {
      const dateA = new Date(String(valueA)).getTime();
      const dateB = new Date(String(valueB)).getTime();

      const isInvalidA = Number.isNaN(dateA);
      const isInvalidB = Number.isNaN(dateB);

      if (isInvalidA && isInvalidB) return 0;
      if (isInvalidA) return 1;
      if (isInvalidB) return -1;

      return dateA - dateB;
    }

    // text, string, badge: alphabetical + case-insensitive + natural numeric
    return String(valueA).localeCompare(String(valueB), undefined, {
      numeric: true,
      sensitivity: 'base',
    });
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
    if (!this.enableRowClick) return;
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

  isActionDisabled(act: TableAction, row: Record<string, unknown>): boolean {
    return typeof act.disabled === 'function'
      ? act.disabled(row)
      : act.disabled === true;
  }

  onTableScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 50;
    const atBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight <=
      threshold;

    if (atBottom && this.hasMoreData) {
      this.loadMore.emit();
    }
  }

  // handle filter apply
  applyFilter(columnKey: string, event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    if (filterValue.trim() === '') {
      delete this.filterValues[columnKey];
    } else {
      this.filterValues[columnKey] = filterValue.trim().toLowerCase();
    }

    this.data = this.originalData.filter((row) => {
      return Object.keys(this.filterValues).every((key) => {
        const val = this.filterValues[key];
        if (!val) return true;
        const rowValue = String(row[key] || '').toLowerCase();
        return rowValue.includes(val);
      });
    });
  }

  toggleDropdown(colKey: string, event: Event): void {
    event.stopPropagation();
    const isOpening = this.activeDropdownCol !== colKey;
    this.activeDropdownCol = isOpening ? colKey : null;
    if (isOpening) {
      this.dropdownOpened.emit(colKey);
    }
  }

  getSelectedFilterLabel(colKey: string): string {
    const val = this.filterValues[colKey];
    if (!val) return '';
    return val;
  }

  // close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    this.activeDropdownCol = null;
  }

  onDropdownSearch(colKey: string, searchTerm: string): void {
    this.dropdownSearchChange.emit({ columnKey: colKey, searchTerm });
    this.filterSearch.emit({ columnKey: colKey, searchTerm });
  }

  onDropdownOpen(colKey: string): void {
    this.dropdownOpened.emit(colKey)
  }

  getDropdownOptions(columnKey: string): DropdownOptions[] {
    return this.dropdownOptionsMap[columnKey] || [];
  }

  isDropdownLoading(columnKey: string): boolean {
    return this.dropdownLoadingMap[columnKey] || false;
  }

  getSelectedValues(columnKey: string): (string | number)[] {
    return this.selectedFiltersMap[columnKey] || [];
  }

  onDropdownSelectionChange(columnKey: string, option: DropdownOptions): void {
    this.dropdownSelectionChange.emit({ columnKey, option });
  }

  onDropdownScroll(columnKey: string): void {
    this.dropdownScrolled.emit(columnKey);
  }

  onDropdownApply(columnKey: string): void {
    this.filterApply.emit({ columnKey });
    this.activeDropdownCol = null;
  }

  onDropdownClear(columnKey: string): void {
    if (this.selectedFiltersMap && this.selectedFiltersMap[columnKey]) {
      delete this.selectedFiltersMap[columnKey];
    }

    if (this.filterValues && this.filterValues[columnKey]) {
      delete this.filterValues[columnKey];
    }
    this.reapplyAllFilters();
    this.filterClear.emit(columnKey);
  }

  private reapplyAllFilters(): void {
    this.data = this.originalData.filter((row) => {
      return Object.keys(this.filterValues).every((key) => {
        const val = this.filterValues[key];
        if (!val) return true;
        const rowValue = String(row[key] || '').toLowerCase();
        return rowValue.includes(val);
      });
    });
  }

}
