import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef, MatDialogClose, MatDialogTitle } from '@angular/material/dialog';
import { map, Observable, ReplaySubject, startWith, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-filter-dialog',
  templateUrl: './filter-dialog.component.html',
  styleUrl: './filter-dialog.component.css',
})
export class FilterDialogComponent {
  private dialogRef = inject((MatDialogRef<FilterDialogComponent>));
  private fb = inject(FormBuilder);

  public filterForm!: FormGroup;
  public years: number[] = [];

  public yearFilterForm: FormControl = new FormControl('');
  public filteredYear: ReplaySubject<number[]> = new ReplaySubject<number[]>(1);
  private destroy$ = new Subject<void>();
  
  ngOnInit(): void {
    this.generateYears();
    this.initializeForm();

    this.filteredYear.next(this.years.slice());
   this.yearFilterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.filterYears();
    });
  }

  private initializeForm(): void {
    this.filterForm = this.fb.group({
      year: [null],
    });
  }

  private generateYears(): void {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - 100;
    for (let year = currentYear; year >= startYear; year--) {
      this.years.push(year);
    }
  }

  private filterYears(): void {
    if (!this.years) {
      return;
    }
    let search = this.yearFilterForm.value;
    if (!search) {
      this.filteredYear.next(this.years.slice());
      return;
    } else{
      search = search.toLowerCase();
    }
    this.filteredYear.next(
      this.years.filter((year) => year.toString().toLowerCase().indexOf(search) > -1)
    )
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public applyFilter(): void {
    const selectedValue = this.filterForm.get('year')?.value;
    if (selectedValue) {
      this.dialogRef.close(selectedValue);
    }
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }

}
