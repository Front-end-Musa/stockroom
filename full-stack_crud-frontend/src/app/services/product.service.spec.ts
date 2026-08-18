import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../environments/environment';
import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('uses the configured API URL for product requests', () => {
    service.getById(7).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/products/7`);

    expect(request.request.method).toBe('GET');
    request.flush({
      id: 7,
      name: 'Mechanical keyboard',
      description: null,
      price: 89.99,
      stock: 4,
      createdAtUtc: '2026-08-17T12:00:00Z',
    });
  });
});
