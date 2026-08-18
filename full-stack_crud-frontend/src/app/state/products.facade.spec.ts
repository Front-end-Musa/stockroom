import { TestBed } from '@angular/core/testing';
import { Store, provideStore } from '@ngrx/store';

import { ProductRequest } from '../contracts/product-request';
import { Product } from '../models/product';
import { PagedResponse } from '../models/paged-response.interface';
import { ProductActions } from './products.actions';
import { ProductsFacade } from './products.facade';
import { productsReducer } from './products.reducer';

describe('ProductsFacade', () => {
  let facade: ProductsFacade;
  let store: Store;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideStore({ products: productsReducer })],
    });

    facade = TestBed.inject(ProductsFacade);
    store = TestBed.inject(Store);
  });

  it('should expose product and pagination state through signals', () => {
    const product: Product = {
      id: 1,
      name: 'Mechanical keyboard',
      description: 'Compact and wireless',
      price: 89.99,
      stock: 4,
      createdAtUtc: '2026-08-17T12:00:00Z',
    };
    const data: PagedResponse<Product> = {
      items: [product],
      page: 2,
      pageSize: 10,
      totalItems: 11,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    };

    store.dispatch(ProductActions.loadProductsSuccess({ data }));

    expect(facade.products()).toEqual([product]);
    expect(facade.loading()).toBe(false);
    expect(facade.apiConnected()).toBe(true);
    expect(facade.unitsInStock()).toBe(4);
    expect(facade.lowStockCount()).toBe(1);
    expect(facade.inventoryValue()).toBe(359.96);
    expect(facade.page()).toBe(2);
    expect(facade.pageSize()).toBe(10);
    expect(facade.totalItems()).toBe(11);
    expect(facade.totalPages()).toBe(2);
    expect(facade.hasPreviousPage()).toBe(true);
    expect(facade.hasNextPage()).toBe(false);
  });

  it('should dispatch product commands', () => {
    const product: ProductRequest = {
      name: 'Mechanical keyboard',
      description: null,
      price: 89.99,
      stock: 4,
    };
    const dispatch = vi.spyOn(store, 'dispatch');

    facade.loadProducts('keyboard', 2, 25);
    facade.createProduct(product);
    facade.updateProduct(7, product);
    facade.deleteProduct(7);
    facade.dismissError();

    expect(dispatch).toHaveBeenNthCalledWith(
      1,
      ProductActions.loadProducts({ search: 'keyboard', page: 2, pageSize: 25 }),
    );
    expect(dispatch).toHaveBeenNthCalledWith(2, ProductActions.createProduct({ product }));
    expect(dispatch).toHaveBeenNthCalledWith(3, ProductActions.updateProduct({ id: 7, product }));
    expect(dispatch).toHaveBeenNthCalledWith(4, ProductActions.deleteProduct({ id: 7 }));
    expect(dispatch).toHaveBeenNthCalledWith(5, ProductActions.dismissError());
  });
});
