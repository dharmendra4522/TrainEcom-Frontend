import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewRatingDialogComponent } from './review-rating-dialog.component';

describe('ReviewRatingDialogComponent', () => {
  let component: ReviewRatingDialogComponent;
  let fixture: ComponentFixture<ReviewRatingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReviewRatingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewRatingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
