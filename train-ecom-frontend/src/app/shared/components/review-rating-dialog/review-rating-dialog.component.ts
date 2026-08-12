import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogContent } from '@angular/material/dialog';

@Component({
  selector: 'app-review-rating-dialog',
  templateUrl: './review-rating-dialog.component.html',
  styleUrl: './review-rating-dialog.component.css',
})
export class ReviewRatingDialogComponent {
  private dialogRef = inject(MatDialogRef<ReviewRatingDialogComponent>);

  public data = inject(MAT_DIALOG_DATA) as {
    productId: string | number;
    productName: string;
    existingRating?: number;
    existingReview?: string;
    isEdit?: boolean;
    reviewId?: string;
  };

  rating: number = 0;
  review: string = '';
  stars: number[] = [1, 2, 3, 4, 5];
  isEditMode: boolean = false;

  ngOnInit(): void {
    if (this.data && this.data.isEdit) {
      this.isEditMode = true;
      this.rating = this.data.existingRating || 0;
      this.review = this.data.existingReview || '';
    }
  }

  setRating(selectedRating: number): void {
    this.rating = selectedRating;
  }

  onSubmit(): void {
    if (this.rating > 0) {
      this.dialogRef.close({
        productId: this.data.productId,
        rating: this.rating,
        review: this.review,
        reviewId: this.data.reviewId
      });
    }
  }

  getRatingTextAndColor(): { text: string, colorClass: string } {
    switch (this.rating) {
      case 1:
        return { text: 'Very Bad', colorClass: 'text-danger' };
      case 2:
        return { text: 'Bad', colorClass: 'text-warning' };
      case 3:
        return { text: 'Good', colorClass: 'text-success' };
      case 4:
        return { text: 'Very Good', colorClass: 'text-success' };
      case 5:
        return { text: 'Excellent', colorClass: 'text-success' };
      default:
        return { text: '', colorClass: '' };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
