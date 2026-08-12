export interface Review {
    reviewId: string;
    productId: string | number;
    userName: string;
    rating: number;
    review: string;
    createdAt: string;
    updatedAt: string | null;
}

export interface ProductReviewsResponse {
    productId: string;
    averageRating: number;
    totalReviews: number;
    reviews: Review[];
    pageNumber: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
}

export interface CreateReviewRequest {
    rating: number;
    review?: string;
}

export interface CreateReviewResponse {
    status: boolean;
    Message: string;
}

export interface UpdateReviewRequest {
    rating: number;
    review?: string;
}

export interface UpdateReviewResponse {
    status: boolean;
    Message: string;
}

export type OrderItemReviewSummary = Pick<Review, 'reviewId' | 'review' | 'rating' >;