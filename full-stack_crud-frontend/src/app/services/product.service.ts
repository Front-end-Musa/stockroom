import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { ProductRequest } from '../contracts/product-request';
import { Product } from '../models/product';
import { PagedResponse } from '../models/paged-response.interface';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5135/api/products';

  getAll(search: string, sortBy = 'createdAtUtc', sortDirection: 'asc' | 'desc' = 'desc', page = 1, pageSize = 10) {
    let params = new HttpParams().set('sortBy', sortBy).set('sortDirection', sortDirection).set('page', page).set('pageSize', pageSize);
    const normalizedSearch = search.trim();

    if (normalizedSearch) {
      params = params.set('search', normalizedSearch);
    }

    return this.http.get<PagedResponse<Product>>(this.apiUrl, { params });
  }

  getById(id: number) {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  create(product: ProductRequest) {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: ProductRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
