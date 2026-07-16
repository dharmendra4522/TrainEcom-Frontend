import { Component } from '@angular/core';
import { Product } from '../../../../core/models/auth.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  dummyProducts: Product[] = [
    {
      id: 1,
      title: 'Product 1',
      price: 299.99,
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a high-quality product with excellent features.',
      category: 'Electronics',
      images: ['https://placehold.co/300x300'],
      brand: 'AudioTech'
    },
    {
      id: 2,
      title: 'Product 2',
      price: 199.50,
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a high-quality product with excellent features.',
      category: 'Wearables',
      images: ['https://placehold.co/300x300'],
      brand: 'FitLife'
    },
    {
      id: 3,
      title: 'Product 3',
      price: 1299.00,
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a high-quality product with excellent features.',
      category: 'Computers',
      images: ['https://placehold.co/300x300'],
      brand: 'TechPro'
    },
    {
      id: 4,
      title: 'Product 4',
      price: 89.99,
      description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. This is a high-quality product with excellent features.',
      category: 'Accessories',
      images: ['https://placehold.co/300x300'],
      brand: 'GameMaster'
    }
  ];
}
