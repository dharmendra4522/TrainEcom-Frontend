import { Component } from '@angular/core';
import { Product } from '../../../../core/models/product.model';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  wishlist: Product[] = [
    {
      id: '1',
      name: 'Gucci duffle bag',
      price: 960,
      description: 'Elegant duffle bag with iconic design, spacious and stylish.',
      categoryName: 'Bags',
      brandName: 'Gucci',
      images: [
        { id: 'img-1', imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
    {
      id: '2',
      name: 'RGB liquid CPU Cooler',
      price: 1960,
      description: 'High-performance RGB liquid CPU cooler with dual fans.',
      categoryName: 'Electronics',
      brandName: 'CoolerMaster',
      images: [
        { id: 'img-2', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
    {
      id: '3',
      name: 'GP11 Shooter USB Gamepad',
      price: 550,
      description: 'Ergonomic USB gaming controller with dual vibration feedback.',
      categoryName: 'Gaming',
      brandName: 'GP',
      images: [
        { id: 'img-3', imageUrl: 'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
    {
      id: '4',
      name: 'Quilted Satin Jacket',
      price: 750,
      description: 'Comfortable and fashionable quilted satin jacket for all seasons.',
      categoryName: 'Apparel',
      brandName: 'SatinStyle',
      images: [
        { id: 'img-4', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
  ];

  justForYouItems: Product[] = [
    {
      id: '5',
      name: 'ASUS FHD Gaming Laptop',
      price: 960,
      description: '15.6" FHD display gaming laptop with latest processor and graphics.',
      categoryName: 'Electronics',
      brandName: 'ASUS',
      images: [
        { id: 'img-5', imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
    {
      id: '6',
      name: 'IPS LCD Gaming Monitor',
      price: 1160,
      description: '27-inch IPS LCD gaming monitor with 144Hz refresh rate.',
      categoryName: 'Electronics',
      brandName: 'MSI',
      images: [
        { id: 'img-6', imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
    {
      id: '7',
      name: 'HAVIT HV-G92 Gamepad',
      price: 560,
      description: 'Classic red gamepad with responsive controls and custom grip.',
      categoryName: 'Gaming',
      brandName: 'HAVIT',
      images: [
        { id: 'img-7', imageUrl: 'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
    {
      id: '8',
      name: 'AK-900 Wired Keyboard',
      price: 200,
      description: 'Backlit wired mechanical feel keyboard for gaming and typing.',
      categoryName: 'Gaming',
      brandName: 'AK',
      images: [
        { id: 'img-8', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80', isPrimary: true }
      ],
    },
  ];

  removeFromWishlist(item: Product): void {
    this.wishlist = this.wishlist.filter((w) => w.id !== item.id);
  }

  addToCart(item: Product): void {
    console.log('Adding to cart:', item);
  }

  moveAllToBag(): void {
    console.log('Moving all wishlist items to bag');
  }

  seeAllRecommendations(): void {
    console.log('See all recommendations clicked');
  }
}