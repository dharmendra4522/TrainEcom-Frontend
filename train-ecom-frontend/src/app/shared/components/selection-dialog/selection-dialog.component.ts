import { Component, Inject, Optional, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface SelectionDialogItem {
  id: string | number;
}

export interface SelectionDialogData<T extends SelectionDialogItem> {
  title: string;
  items: T[];
  selectedId?: string | number;
  displayKey: string;
  secondaryKey?: string;
  addButtonLabel?: string;
}

@Component({
  selector: 'app-selection-dialog',
  templateUrl: './selection-dialog.component.html',
  styleUrl: './selection-dialog.component.css',
})
export class SelectionDialogComponent<
  T extends SelectionDialogItem = SelectionDialogItem,
> {
  private dialogRef = inject(MatDialogRef, { optional: true }) as MatDialogRef<
    SelectionDialogComponent<T>
  >;

  constructor(
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: SelectionDialogData<T> = {
      title: '',
      items: [],
      displayKey: 'id',
    },
  ) {}

  getItemValue(item: T, key?: string): string {
    if (!key) return '';

    const value = (item as unknown as Record<string, unknown>)[key];
    return value === null || value === undefined ? '' : String(value);
  }

  onSelect(item: T): void {
    if (this.dialogRef) {
      this.dialogRef.close(item);
    }
  }

  onClose(): void {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onAdd(): void {
    if (this.dialogRef) {
      this.dialogRef.close('add');
    }
  }

  onEdit(item: T, event: Event): void {
    event.stopPropagation(); // Prevent the click from propagating to the parent element
    if (this.dialogRef) {
      this.dialogRef.close({ action: 'edit', item });
    }
  }

  onDelete(item: T, event: Event): void {
    event.stopPropagation();
    if (this.dialogRef) {
      this.dialogRef.close({ action: 'delete', item });
    }
  }
}
