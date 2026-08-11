import { Component, inject, Input, SimpleChanges } from '@angular/core';
import { Review } from '../../../../core/models/review.model';
import { ReviewService } from '../../../../core/services/review.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-reviews',
  templateUrl: './product-reviews.component.html',
  styleUrl: './product-reviews.component.css'
})
export class ProductReviewsComponent {

  private reviewService = inject(ReviewService);

  // Input property to receive the productId from the parent component
  @Input() productId!: string | number;

  reviews: Review[] = [];
  averageRating: number = 0;
  totalReviews: number = 0;
  isLoading: boolean = true;

  pageNumber: number = 1;
  pageSize: number = 5;
  totalRecords: number = 0;
  hasMoreReviews: boolean = true;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['productId'] && this.productId) {
      this.pageNumber = 1;
      this.reviews = []; // Purana data reset karein
      this.loadProductReviews();
    }
  }

  loadProductReviews(): void {
    this.isLoading = true;

    this.reviewService.getProductReviews(this.productId, this.pageNumber, this.pageSize).subscribe({
      next: (res) => {
        this.reviews = [...this.reviews, ...res.reviews];
        this.averageRating = res.averageRating;
        this.totalReviews = res.totalReviews;
        this.totalRecords = res.totalRecords;

        // check if there are more reviews to load
        this.hasMoreReviews = this.reviews.length < this.totalRecords;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching product reviews:', err);
        this.isLoading = false;
      }
    });
  }

  // Helper method to generate an array for displaying star ratings (Full, Half, Empty)
  getStarArray(rating: number): string[] {
    const stars: string[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        stars.push('star'); // full star
      } else if (rating >= i - 0.5) {
        stars.push('star_half'); // half star
      } else {
        stars.push('star_border'); // empty star
      }
    }
    return stars;
  }

  loadMoreReviews(): void {
    if (this.hasMoreReviews && !this.isLoading) {
      this.pageNumber++;
      this.loadProductReviews();
    }
  }

}
