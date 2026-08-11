import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { CreateReviewRequest, CreateReviewResponse, ProductReviewsResponse } from '../models/review.model';
import { Observable } from 'rxjs/internal/Observable';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private baseAPI = `${environment.apiBaseUrl}/products`;
  private http = inject(HttpClient);

  addReview(productId: string | number, createReviewRequest: CreateReviewRequest): Observable<CreateReviewResponse> {
    return this.http.post<CreateReviewResponse>(`${this.baseAPI}/${productId}/add/reviews`, createReviewRequest);
  }

  getProductReviews(productId: string | number, pageNumber: number = 1, pageSize: number = 5): Observable<ProductReviewsResponse> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<ProductReviewsResponse>(`${environment.apiBaseUrl}/products/${productId}/reviews`, { params });
  }

  // updateReview(productId: string | number, updateReviewRequest: CreateReviewRequest): Observable<CreateReviewResponse> {
  //   return this.http.post<CreateReviewResponse>(`${this.baseAPI}/${productId}/update/reviews`, updateReviewRequest);
  // }

}
