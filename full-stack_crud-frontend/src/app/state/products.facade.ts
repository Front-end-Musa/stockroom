import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';

import { ProductRequest } from '../contracts/product-request';
import { ProductActions } from './products.actions';
import {
  selectApiConnected,
  selectCurrentPage,
  selectDeletingProductId,
  selectHasNextPage,
  selectHasPreviousPage,
  selectInventoryValue,
  selectLowStockCount,
  selectPageSize,
  selectProductSaving,
  selectProducts,
  selectProductsError,
  selectProductsLoading,
  selectTotalItems,
  selectTotalPages,
  selectUnitsInStock,
} from './products.selectors';

@Injectable({ providedIn: 'root' })
export class ProductsFacade {
  private readonly store = inject(Store);

  readonly products = this.store.selectSignal(selectProducts);
  readonly loading = this.store.selectSignal(selectProductsLoading);
  readonly apiConnected = this.store.selectSignal(selectApiConnected);
  readonly saving = this.store.selectSignal(selectProductSaving);
  readonly deletingId = this.store.selectSignal(selectDeletingProductId);
  readonly error = this.store.selectSignal(selectProductsError);
  readonly unitsInStock = this.store.selectSignal(selectUnitsInStock);
  readonly lowStockCount = this.store.selectSignal(selectLowStockCount);
  readonly inventoryValue = this.store.selectSignal(selectInventoryValue);
  readonly page = this.store.selectSignal(selectCurrentPage);
  readonly pageSize = this.store.selectSignal(selectPageSize);
  readonly totalItems = this.store.selectSignal(selectTotalItems);
  readonly totalPages = this.store.selectSignal(selectTotalPages);
  readonly hasPreviousPage = this.store.selectSignal(selectHasPreviousPage);
  readonly hasNextPage = this.store.selectSignal(selectHasNextPage);

  loadProducts(search: string, page: number, pageSize: number) {
    this.store.dispatch(ProductActions.loadProducts({ search, page, pageSize }));
  }

  createProduct(product: ProductRequest) {
    this.store.dispatch(ProductActions.createProduct({ product }));
  }

  updateProduct(id: number, product: ProductRequest) {
    this.store.dispatch(ProductActions.updateProduct({ id, product }));
  }

  deleteProduct(id: number) {
    this.store.dispatch(ProductActions.deleteProduct({ id }));
  }

  dismissError() {
    this.store.dispatch(ProductActions.dismissError());
  }
}
