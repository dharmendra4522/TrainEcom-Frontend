import { Component } from '@angular/core';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  wishlist = [
    {
      id: 1,
      title: 'Gucci duffle bag',
      price: 960,
      description:
        'Elegant duffle bag with iconic design, spacious and stylish.',
      category: 'Bags',
      brand: 'Gucci',
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=300&q=80',
      ],
    },
    {
      id: 2,
      title: 'RGB liquid CPU Cooler',
      price: 1960,
      description: 'High-performance RGB liquid CPU cooler with dual fans.',
      category: 'Electronics',
      brand: 'CoolerMaster',
      images: [
        'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=300&q=80',
      ],
    },
    {
      id: 3,
      title: 'GP11 Shooter USB Gamepad',
      price: 550,
      description:
        'Ergonomic USB gaming controller with dual vibration feedback.',
      category: 'Gaming',
      brand: 'GP',
      images: [
        'https://images.unsplash.com/photo-1600861195091-690c92f1d2cc?auto=format&fit=crop&w=300&q=80',
      ],
    },
    {
      id: 4,
      title: 'Quilted Satin Jacket',
      price: 750,
      description:
        'Comfortable and fashionable quilted satin jacket for all seasons.',
      category: 'Apparel',
      brand: 'SatinStyle',
      images: [
        'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=300&q=80',
      ],
    },
  ];

  justForYouItems = [
    {
      id: 5,
      title: 'ASUS FHD Gaming Laptop',
      price: 960,
      description:
        '15.6" FHD display gaming laptop with latest processor and graphics.',
      category: 'Electronics',
      brand: 'ASUS',
      images: [
        'https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=300&q=80',
      ],
    },
    {
      id: 6,
      title: 'IPS LCD Gaming Monitor',
      price: 1160,
      description: '27-inch IPS LCD gaming monitor with 144Hz refresh rate.',
      category: 'Electronics',
      brand: 'MSI',
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=300&q=80',
      ],
    },
    {
      id: 7,
      title: 'HAVIT HV-G92 Gamepad',
      price: 560,
      description:
        'Classic red gamepad with responsive controls and custom grip.',
      category: 'Gaming',
      brand: 'HAVIT',
      images: [
        'https://images.unsplash.com/photo-1592840496694-26d035b52b48?auto=format&fit=crop&w=300&q=80',
      ],
    },
    {
      id: 8,
      title: 'AK-900 Wired Keyboard',
      price: 200,
      description:
        'Backlit wired mechanical feel keyboard for gaming and typing.',
      category: 'Gaming',
      brand: 'AK',
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=300&q=80',
      ],
    },
  ];

  removeFromWishlist(item: any): void {
    this.wishlist = this.wishlist.filter((w) => w.id !== item.id);
  }

  addToCart(item: any): void {
    console.log('Adding to cart:', item);
  }

  moveAllToBag(): void {
    console.log('Moving all wishlist items to bag');
  }

  seeAllRecommendations(): void {
    console.log('See all recommendations clicked');
  }
}
