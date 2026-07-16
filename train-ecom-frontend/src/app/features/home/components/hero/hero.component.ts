import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  banners = [
    {
      id: 1,
      imageUrl: 'assets/great-sale.png',
      title: 'Summer Sale',
      description: 'Get up to 50% off on selected items!',
      ctaText: 'Shop Now',
    },
    {
      id: 2,
      imageUrl: 'assets/discount.jpg',
      title: 'New Arrivals',
      description: 'Check out the latest products in our collection.',
      ctaText: 'Explore',
    },
    {
      id: 3,
      imageUrl: 'assets/shopping.jpg',
      title: 'Exclusive Deals',
      description: 'Sign up for our newsletter to receive exclusive offers.',
      ctaText: 'Sign Up',
    },
    {
      id: 4,
      imageUrl: 'assets/summer-sale.jpg',
      title: 'Limited Time Offer',
      description: 'Hurry! Grab your favorite items before they are gone.',
      ctaText: 'Shop Now',
    }
  ]
}
