import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PaginatedProducts, Product } from '../models/product.interface';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private readonly url = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) {}

  getProducts(page = 1, limit = 10): Observable<PaginatedProducts> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<PaginatedProducts>(this.url, { params });
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.url}/${id}`);
  }
}
