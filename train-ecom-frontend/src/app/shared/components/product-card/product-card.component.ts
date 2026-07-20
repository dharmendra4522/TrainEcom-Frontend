import { Component, Input } from '@angular/core';
import { Product } from '../../../core/models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {

  @Input() product!: Product;
  

  constructor() { }

  addToCart(product: Product): void {
    console.log('Adding product to cart:', product);
  }
}
