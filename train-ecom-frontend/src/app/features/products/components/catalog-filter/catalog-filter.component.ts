import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Brand } from '../../../../core/models/brand.model';
import { Category } from '../../../../core/models/category.model';

@Component({
  selector: 'app-catalog-filter',
  templateUrl: './catalog-filter.component.html',
  styleUrls: ['./catalog-filter.component.css']
})
export class CatalogFilterComponent {
  @Input() categories: Category[] = [];
  @Input() brands: Brand[] = [];
  @Input() selectedCategory: string = '';
  @Input() selectedBrand: string = '';
  @Input() maxPriceSliderValue: number = 10000;
  @Input() activeRating: number | null = null;
  @Input() activeSort: string = '';

  @Output() categoryChange = new EventEmitter<string>();
  @Output() brandChange = new EventEmitter<string>();
  @Output() priceSliderChange = new EventEmitter<number>();
  @Output() ratingChange = new EventEmitter<number | null>();
  @Output() sortChange = new EventEmitter<string>();
  @Output() resetAll = new EventEmitter<void>();

}
