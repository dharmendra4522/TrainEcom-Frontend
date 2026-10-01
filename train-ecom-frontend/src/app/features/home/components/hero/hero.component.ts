import { Component, AfterViewInit, inject, OnInit } from '@angular/core';
import { BannerService } from '../../../../core/services/banner.service';
import { Banner } from '../../../../core/models/setting.model';

declare const bootstrap: {
  Carousel: new (
    element: HTMLElement,
    options?: { interval?: number; ride?: string; pause?: boolean | string },
  ) => { cycle: () => void; pause: () => void };
};

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements OnInit {
  private bannerService = inject(BannerService);
  banners: Banner[] = [];

  ngOnInit(): void {
    this.fetchBanners();
  }

  // fetch banners from API
  fetchBanners(): void {
    this.bannerService.getAllBanners().subscribe({
      next: (response) => {
        this.banners = response;
        setTimeout(() => {
          const carouselElement = document.getElementById('homeHeroCarousel');
          if (carouselElement) {
            new bootstrap.Carousel(carouselElement, {
              interval: 3000,
              ride: 'carousel',
              pause: false
            });
          }
        }, 0)
      }, error: (err) => {
        console.error('Error fetching banners:', err);
      }
    })
  }

}
