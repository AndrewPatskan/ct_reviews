import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateReview, PaginatedReviews, Review } from '../models/review.interface';

@Injectable({ providedIn: 'root' })
export class ReviewsService {
  private readonly url = `${environment.apiUrl}/reviews`;

  constructor(private http: HttpClient) {}

  getReviews(productId: string, page = 1, limit = 5): Observable<PaginatedReviews> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedReviews>(`${this.url}/product/${productId}`, { params });
  }

  createReview(review: CreateReview): Observable<Review> {
    return this.http.post<Review>(this.url, review);
  }
}
