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
  };

  rating: number = 0;
  review: string = '';
  stars: number[] = [1, 2, 3, 4, 5];
  isEditMode: boolean = false;

  ngOnInit(): void {
    if(this.data && this.data.isEdit) {
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
        review: this.review
      });
    }
  }


  onCancel(): void {
    this.dialogRef.close();
  }

}
