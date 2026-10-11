import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Brand } from '../../../../core/models/brand.model';
import { Category, SubCategoryItem } from '../../../../core/models/category.model';

@Component({
  selector: 'app-catalog-filter',
  templateUrl: './catalog-filter.component.html',
  styleUrls: ['./catalog-filter.component.css'],
})
export class CatalogFilterComponent {
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() selectedCategory: string = '';
  @Input() selectedBrand: string = '';
  @Input() maxPriceSliderValue: number = 10000;
  @Input() activeRating: number | null = null;
  @Input() activeSort: string = '';
  @Input() selectedSubCategory: string = '';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() brandChange = new EventEmitter<string>();
  @Output() priceSliderChange = new EventEmitter<number>();
  @Output() ratingChange = new EventEmitter<number | null>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() resetAll = new EventEmitter<void>();
  @Output() subCategoryChange = new EventEmitter<string>();

  onReset(): void {
    this.resetAll.emit();
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.categoryChange.emit(value);
  }
  onBrandChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.brandChange.emit(value);
  }
  onPriceSliderChange(event: Event): void {
    const value = +(event.target as HTMLInputElement).value;
    this.priceSliderChange.emit(value);
  }

  onRatingChange(event: Event): void {
    const rawValue = (event.target as HTMLSelectElement).value;
    const value = rawValue ? +rawValue : null;
    this.ratingChange.emit(value);
  }

  onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.sortChange.emit(value);
  }

  onSubCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.subCategoryChange.emit(value);
  }

  get availableSubCategories(): SubCategoryItem[] {
    return (
      this.categories.find(
        (category) => category.id.toString() === this.selectedCategory,
      )
        ?.subCategories ?? []
    );
  }
}
