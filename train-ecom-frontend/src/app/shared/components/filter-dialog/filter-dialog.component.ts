import { Component, inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogRef
} from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReplaySubject } from 'rxjs';
import { DashboardService } from '../../../core/services/dashboard.service';

export interface FilterDialogData {
  year?: number | null;
  vendors?: number[];
  isVendor?: boolean;
  fromDate?: Date | null;
  toDate?: Date | null;
}
export interface FilterDialogResult {
  year: number | null;
  vendors: number[];
  fromDate: Date | null;
  toDate: Date | null;
  count: number;
  cleared?: boolean;
}
interface VendorOption {
  id: number;
  name: string;
}
@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css'
})
export class FilterDialogComponent {
  private dialogRef = inject(MatDialogRef<FilterDialogComponent>);
  public data = inject<FilterDialogData>(MAT_DIALOG_DATA);
  private dashboardService = inject(DashboardService);

  public filterForm = new FormGroup({
    year: new FormControl<number | null>(null),
    vendors: new FormControl<number[]>([], { nonNullable: true }),
    fromDate: new FormControl<Date | null>(null),
    toDate: new FormControl<Date | null>(null)
  });
  public years: number[] = [];
  public vendorOptions: VendorOption[] = [];

  public yearFilterForm = new FormControl('', { nonNullable: true });
  public filteredYear: ReplaySubject<number[]> = new ReplaySubject<number[]>(1);
  public vendorFilterForm = new FormControl('', { nonNullable: true });
  public filteredVendors: ReplaySubject<VendorOption[]> =
    new ReplaySubject<VendorOption[]>(1);

  constructor() {
    this.yearFilterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.filterYears());

    this.vendorFilterForm.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.filterVendors());
  }

  ngOnInit(): void {
    this.generateYears();
    this.filteredYear.next(this.years.slice());
    if (!this.data.isVendor) {
      this.fetchVendors();
    }

    this.filterForm.setValue({
      year: this.data.year ?? null,
      vendors: this.data.vendors ?? [],
      fromDate: this.data.fromDate ?? null,
      toDate: this.data.toDate ?? null
    });
  }

  private fetchVendors(): void {
    this.dashboardService.fetchVendorList().subscribe({
      next: (vendors) => {
        this.vendorOptions = vendors.map(v => ({ id: v.vendorId, name: v.vendorName }));
        this.filteredVendors.next(this.vendorOptions.slice());
      },
      error: (err) => console.error('Failed to load vendors', err)
    });
  }

  private filterYears(): void {
    const search = this.yearFilterForm.value.trim();
    this.filteredYear.next(
      this.years.filter((year) => year.toString().includes(search))
    );
  }

  private filterVendors(): void {
    const search = this.vendorFilterForm.value.trim().toLowerCase();
    this.filteredVendors.next(
      this.vendorOptions.filter((vendor) =>
        vendor.name.toLowerCase().includes(search)
      )
    );
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  public applyFilter(): void {
    const { year, vendors, fromDate, toDate } = this.filterForm.getRawValue();
    if (
      year !== null ||
      vendors.length > 0 ||
      fromDate !== null ||
      toDate !== null
    ) {
      this.dialogRef.close({
        year,
        vendors,
        fromDate,
        toDate,
        count:
          (year !== null ? 1 : 0) +
          (vendors.length > 0 ? 1 : 0) +
          (fromDate !== null ? 1 : 0) +
          (toDate !== null ? 1 : 0)
      });
    }
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

  public clearFilter(): void {
    this.dialogRef.close({
      year: null,
      vendors: [],
      fromDate: null,
      toDate: null,
      count: 0,
      cleared: true
    });
  }

  public clearYearSelection(): void {
    this.filterForm.controls.year.setValue(null);
  }

  public clearVendorSelection(): void {
    this.filterForm.controls.vendors.setValue([]);
  }

  public clearFromDate(): void {
    this.filterForm.controls.fromDate.setValue(null);
  }

  public clearToDate(): void {
    this.filterForm.controls.toDate.setValue(null);
  }
}