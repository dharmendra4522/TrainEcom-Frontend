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
      imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1200&q=80',
      title: 'iPhone 15 Pro Max',
      description: 'Experience the future of smartphones. Titan design, A17 Pro chip.',
      ctaText: 'Shop Now',
    },
    {
      id: 2,
      imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1200&q=80',
      title: 'Premium Sound, Zero Noise',
      description: 'Active noise cancelling over-ear headphones with 40-hour battery life.',
      ctaText: 'Explore',
    },
    {
      id: 3,
      imageUrl: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80',
      title: 'Ultimate Gaming Setup',
      description: 'Level up your gaming experience with high-performance accessories.',
      ctaText: 'Shop Now',
    },
    {
      id: 4,
      imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80',
      title: 'New Summer Fashion',
      description: 'Get up to 40% off on all clothing, bags, and summer essentials.',
      ctaText: 'Explore Collection',
    },
    {
      id: 5,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1200&q=80',
      title: 'Smart Fitness Wearables',
      description: 'Track your health, workouts, and stay connected on the go.',
      ctaText: 'Shop Wearables',
    },
    {
      id: 6,
      imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80',
      title: 'Next-Gen Tablets',
      description: 'Powerful tablets designed for work, creativity, and entertainment.',
      ctaText: 'Shop Tablets',
    }
  ]
}
