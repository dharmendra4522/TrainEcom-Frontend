import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as CategoryActions from '../../../core/store/category/category.action';
import { selectAllCategories } from '../../../core/store/category/category.selectors';

@Component({
  selector: 'app-vendor-business-details',
  templateUrl: './vendor-business-details.component.html',
  styleUrl: './vendor-business-details.component.css',
})
export class VendorBusinessDetailsComponent {
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private store = inject(Store);

  businessForm!: FormGroup;
  categories$!: Observable<Category[]>;

  ngOnInit() {
    this.initalizeForm();
    this.fetchAllCategory();
  }

  private initalizeForm(): void {
    this.businessForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(3)]],
      storeName: ['', [Validators.required, Validators.minLength(3)]],
      companyOverview: ['', [Validators.required, Validators.minLength(10)]],
      storeCategory: ['', Validators.required],
      gstin: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
          ),
        ],
      ],
      panNumber: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^[A-Z]{3}[ABCFGHLJPT]{1}[A-Z]{1}[0-9]{4}[A-Z]{1}$/,
          ),
        ],
      ],
      addressLine1: ['', Validators.required],
      addressLine2: [''],
      city: ['', Validators.required],
      country: ['', Validators.required],
      state: ['', Validators.required],
      postalCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
      bankAccountNumber: [
        '',
        [Validators.required, Validators.pattern(/^\d{9,16}$/)],
      ],
      acountHolderName: ['', Validators.required],
      ifscCode: [
        '',
        [Validators.required, Validators.pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)],
      ],
    });
  }

  onSubmit(): void {
    if (this.businessForm.invalid) {
      return;
    }
    console.log(this.businessForm.value);
  }

  fetchAllCategory() {
    this.store.dispatch(CategoryActions.loadCategories());

    // Store selector se data bind karein
    this.categories$ = this.store.select(selectAllCategories);
  }
}
