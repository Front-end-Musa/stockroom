import { createFeatureSelector, createSelector } from '@ngrx/store';

import { ProductsState } from './products.reducer';

export const selectProductsState = createFeatureSelector<ProductsState>('products');

export const selectProducts = createSelector(selectProductsState, (state) => state.products);

export const selectProductsLoading = createSelector(selectProductsState, (state) => state.loading);

export const selectApiConnected = createSelector(
  selectProductsState,
  (state) => state.apiConnected,
);

export const selectProductSaving = createSelector(selectProductsState, (state) => state.saving);

export const selectDeletingProductId = createSelector(
  selectProductsState,
  (state) => state.deletingId,
);

export const selectProductsError = createSelector(selectProductsState, (state) => state.error);

export const selectUnitsInStock = createSelector(selectProducts, (products) =>
  products.reduce((total, product) => total + product.stock, 0),
);

export const selectLowStockCount = createSelector(
  selectProducts,
  (products) => products.filter((product) => product.stock <= 5).length,
);

export const selectInventoryValue = createSelector(selectProducts, (products) =>
  products.reduce((total, product) => total + product.price * product.stock, 0),
);

// Pagination selectors
export const selectCurrentPage = createSelector(selectProductsState, (state) => state.page);

export const selectPageSize = createSelector(selectProductsState, (state) => state.pageSize);

export const selectTotalItems = createSelector(selectProductsState, (state) => state.totalItems);

export const selectTotalPages = createSelector(selectProductsState, (state) => state.totalPages);

export const selectHasPreviousPage = createSelector(
  selectProductsState,
  (state) => state.hasPreviousPage,
);

export const selectHasNextPage = createSelector(
  selectProductsState,
  (state) => state.hasNextPage,
);
