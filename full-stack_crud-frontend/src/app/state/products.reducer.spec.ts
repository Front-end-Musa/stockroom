import { Product } from '../models/product';
import { PagedResponse } from '../models/paged-response.interface';
import { ProductActions } from './products.actions';
import { initialProductsState, productsReducer } from './products.reducer';

const product: Product = {
  id: 1,
  name: 'Mechanical keyboard',
  description: 'Compact and wireless',
  price: 89.99,
  stock: 12,
  createdAtUtc: '2026-08-17T12:00:00Z',
};

describe('productsReducer', () => {
  it('should load products and mark the API as connected', () => {
    const data: PagedResponse<Product> = {
      items: [product],
      page: 2,
      pageSize: 10,
      totalItems: 11,
      totalPages: 2,
      hasPreviousPage: true,
      hasNextPage: false,
    };
    const state = productsReducer(
      { ...initialProductsState, loading: true },
      ProductActions.loadProductsSuccess({ data }),
    );

    expect(state.products).toEqual([product]);
    expect(state.page).toBe(2);
    expect(state.pageSize).toBe(10);
    expect(state.totalItems).toBe(11);
    expect(state.totalPages).toBe(2);
    expect(state.hasPreviousPage).toBe(true);
    expect(state.hasNextPage).toBe(false);
    expect(state.loading).toBe(false);
    expect(state.apiConnected).toBe(true);
  });

  it('should add a newly created product first', () => {
    const state = productsReducer(
      { ...initialProductsState, products: [product], saving: true },
      ProductActions.createProductSuccess({ product: { ...product, id: 2 } }),
    );

    expect(state.products.map((item) => item.id)).toEqual([2, 1]);
    expect(state.saving).toBe(false);
  });

  it('should update editable product values', () => {
    const state = productsReducer(
      { ...initialProductsState, products: [product], saving: true },
      ProductActions.updateProductSuccess({
        id: product.id,
        product: { name: product.name, description: null, price: 94.5, stock: 4 },
      }),
    );

    expect(state.products[0]).toEqual({
      ...product,
      description: null,
      price: 94.5,
      stock: 4,
    });
    expect(state.saving).toBe(false);
  });

  it('should remove a deleted product', () => {
    const state = productsReducer(
      { ...initialProductsState, products: [product], deletingId: product.id },
      ProductActions.deleteProductSuccess({ id: product.id }),
    );

    expect(state.products).toEqual([]);
    expect(state.deletingId).toBeNull();
  });
});
