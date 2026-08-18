import { createReducer, on } from '@ngrx/store';

import { Product } from '../models/product';
import { ProductActions } from './products.actions';
import { PagedResponse } from '../models/paged-response.interface';

export interface ProductsState {
  products: Product[];
  data: PagedResponse<Product> | null;
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  loading: boolean;
  apiConnected: boolean | null;
  saving: boolean;
  deletingId: number | null;
  error: string | null;
}

export const initialProductsState: ProductsState = {
  products: [],
  data: null,
  page: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 0,
  hasPreviousPage: false,
  hasNextPage: false,
  loading: false,
  apiConnected: null,
  saving: false,
  deletingId: null,
  error: null,
};

export const productsReducer = createReducer(
  initialProductsState,
  on(ProductActions.loadProducts, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ProductActions.loadProductsSuccess, (state, { data }) => ({
    ...state,
    products: data.items,
    data,
    page: data.page,
    pageSize: data.pageSize,
    totalItems: data.totalItems,
    totalPages: data.totalPages,
    hasPreviousPage: data.hasPreviousPage,
    hasNextPage: data.hasNextPage,
    loading: false,
    apiConnected: true,
  })),
  on(ProductActions.loadProductsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    apiConnected: false,
    error,
  })),
  on(ProductActions.createProduct, ProductActions.updateProduct, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ProductActions.createProductSuccess, (state, { product }) => ({
    ...state,
    products: [product, ...state.products],
    saving: false,
  })),
  on(ProductActions.updateProductSuccess, (state, { id, product }) => ({
    ...state,
    products: state.products.map((item) => (item.id === id ? { ...item, ...product } : item)),
    saving: false,
  })),
  on(
    ProductActions.createProductFailure,
    ProductActions.updateProductFailure,
    (state, { error }) => ({
      ...state,
      saving: false,
      error,
    }),
  ),
  on(ProductActions.deleteProduct, (state, { id }) => ({
    ...state,
    deletingId: id,
    error: null,
  })),
  on(ProductActions.deleteProductSuccess, (state, { id }) => ({
    ...state,
    products: state.products.filter((product) => product.id !== id),
    deletingId: null,
  })),
  on(ProductActions.deleteProductFailure, (state, { error }) => ({
    ...state,
    deletingId: null,
    error,
  })),
  on(ProductActions.dismissError, (state) => ({
    ...state,
    error: null,
  })),
);
