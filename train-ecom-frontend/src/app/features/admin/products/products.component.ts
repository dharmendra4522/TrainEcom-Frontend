import { Component } from '@angular/core';
import { Product } from '../../../core/models/product.model';

const dummyProducts: Product[] = [
  { id: 101, title: 'Sony Wireless Headphones', price: 2999, description: 'Noise cancelling', category: 'Electronics', images: [], brand: 'Sony' },
  { id: 102, title: 'Men Slim Fit T-Shirt', price: 499, description: 'Cotton tshirt', category: 'Clothing', images: [], brand: 'Nike' },
  { id: 103, title: 'Samsung Galaxy S23', price: 74999, description: 'Flagship phone', category: 'Electronics', images: [], brand: 'Samsung' },
  { id: 104, title: 'Running Shoes', price: 1599, description: 'Sports shoes', category: 'Footwear', images: [], brand: 'Puma' }
];
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export class ProductsComponent {

  displayedColumns: string[] = ['id', 'title', 'price', 'category', 'brand', 'actions'];
  dataSource = dummyProducts;

}
