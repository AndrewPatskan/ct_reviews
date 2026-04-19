export interface Review {
  _id: string;
  productId: string;
  author: string;
  rating: number;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReview {
  productId: string;
  author: string;
  rating: number;
  text: string;
}

export interface PaginatedReviews {
  data: Review[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
