import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { EMPTY } from 'rxjs';

import { Product } from '../../models/product';
import { ProductsFacade } from '../../state/products.facade';
import { Products } from './products';

const product: Product = {
  id: 1,
  name: 'Mechanical keyboard',
  description: 'Compact and wireless',
  price: 89.99,
  stock: 4,
  createdAtUtc: '2026-08-17T12:00:00Z',
};

describe('Products pagination', () => {
  let fixture: ComponentFixture<Products>;
  let facade: {
    products: ReturnType<typeof signal<Product[]>>;
    loading: ReturnType<typeof signal<boolean>>;
    apiConnected: ReturnType<typeof signal<boolean | null>>;
    saving: ReturnType<typeof signal<boolean>>;
    deletingId: ReturnType<typeof signal<number | null>>;
    error: ReturnType<typeof signal<string | null>>;
    unitsInStock: ReturnType<typeof signal<number>>;
    lowStockCount: ReturnType<typeof signal<number>>;
    inventoryValue: ReturnType<typeof signal<number>>;
    page: ReturnType<typeof signal<number>>;
    pageSize: ReturnType<typeof signal<number>>;
    totalItems: ReturnType<typeof signal<number>>;
    totalPages: ReturnType<typeof signal<number>>;
    hasPreviousPage: ReturnType<typeof signal<boolean>>;
    hasNextPage: ReturnType<typeof signal<boolean>>;
    loadProducts: ReturnType<typeof vi.fn>;
    createProduct: ReturnType<typeof vi.fn>;
    updateProduct: ReturnType<typeof vi.fn>;
    deleteProduct: ReturnType<typeof vi.fn>;
    dismissError: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    facade = {
      products: signal([product]),
      loading: signal(false),
      apiConnected: signal(true),
      saving: signal(false),
      deletingId: signal(null),
      error: signal(null),
      unitsInStock: signal(4),
      lowStockCount: signal(1),
      inventoryValue: signal(359.96),
      page: signal(2),
      pageSize: signal(10),
      totalItems: signal(21),
      totalPages: signal(3),
      hasPreviousPage: signal(true),
      hasNextPage: signal(true),
      loadProducts: vi.fn(),
      createProduct: vi.fn(),
      updateProduct: vi.fn(),
      deleteProduct: vi.fn(),
      dismissError: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [
        { provide: ProductsFacade, useValue: facade },
        { provide: Actions, useValue: new Actions(EMPTY) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    fixture.detectChanges();
    facade.loadProducts.mockClear();
  });

  it('renders the current result range and pagination state', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.querySelector('.result-count')?.textContent).toContain(
      'Showing 11–11 of 21 products',
    );
    expect(element.querySelector('.pagination-summary')?.textContent).toContain('Page 2 of 3');
    expect(element.querySelector<HTMLSelectElement>('.page-size-control select')?.value).toBe('10');
  });

  it('loads adjacent pages and resets to page one when page size changes', () => {
    const element: HTMLElement = fixture.nativeElement;
    const previous = element.querySelector<HTMLButtonElement>('[aria-label="Go to previous page"]');
    const next = element.querySelector<HTMLButtonElement>('[aria-label="Go to next page"]');
    const pageSize = element.querySelector<HTMLSelectElement>('.page-size-control select');

    previous?.click();
    next?.click();
    if (pageSize) {
      pageSize.value = '25';
      pageSize.dispatchEvent(new Event('change'));
    }

    expect(facade.loadProducts).toHaveBeenNthCalledWith(1, '', 1, 10);
    expect(facade.loadProducts).toHaveBeenNthCalledWith(2, '', 3, 10);
    expect(facade.loadProducts).toHaveBeenNthCalledWith(3, '', 1, 25);
  });
});
