import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { ProductRequest } from '../contracts/product-request';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:5135/api/products';

  getAll() {
    return this.http.get<Product[]>(this.apiUrl);
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
