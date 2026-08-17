import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { ProductRequest } from '../../contracts/product-request';
import { Product } from '../../models/product';
import { ProductActions } from '../../state/products.actions';
import {
  selectApiConnected,
  selectDeletingProductId,
  selectInventoryValue,
  selectLowStockCount,
  selectProductSaving,
  selectProducts,
  selectProductsError,
  selectProductsLoading,
  selectUnitsInStock,
} from '../../state/products.selectors';

@Component({
  selector: 'app-products',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  templateUrl: './products.html',
  styleUrl: './products.scss',
})
export class Products implements OnInit {
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly products: Signal<Product[]>;
  protected readonly loading: Signal<boolean>;
  protected readonly apiConnected: Signal<boolean | null>;
  protected readonly saving: Signal<boolean>;
  protected readonly deletingId: Signal<number | null>;
  protected readonly error: Signal<string | null>;
  protected readonly unitsInStock: Signal<number>;
  protected readonly lowStockCount: Signal<number>;
  protected readonly inventoryValue: Signal<number>;

  protected readonly search = signal('');
  protected readonly editingProduct = signal<Product | null>(null);
  protected readonly productToDelete = signal<Product | null>(null);
  protected readonly toast = signal<string | null>(null);

  protected readonly productForm: FormGroup<{
    name: FormControl<string>;
    description: FormControl<string>;
    price: FormControl<number>;
    stock: FormControl<number>;
  }>;

  constructor(
    private readonly store: Store,
    actions$: Actions,
    destroyRef: DestroyRef,
    formBuilder: FormBuilder,
  ) {
    this.products = store.selectSignal(selectProducts);
    this.loading = store.selectSignal(selectProductsLoading);
    this.apiConnected = store.selectSignal(selectApiConnected);
    this.saving = store.selectSignal(selectProductSaving);
    this.deletingId = store.selectSignal(selectDeletingProductId);
    this.error = store.selectSignal(selectProductsError);
    this.unitsInStock = store.selectSignal(selectUnitsInStock);
    this.lowStockCount = store.selectSignal(selectLowStockCount);
    this.inventoryValue = store.selectSignal(selectInventoryValue);
    this.productForm = formBuilder.nonNullable.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
          Validators.pattern(/.*\S.*/),
        ],
      ],
      description: ['', Validators.maxLength(500)],
      price: [0, [Validators.required, Validators.min(0.01), Validators.max(99999999.99)]],
      stock: [0, [Validators.required, Validators.min(0), Validators.pattern(/^\d+$/)]],
    });

    actions$
      .pipe(ofType(ProductActions.createProductSuccess), takeUntilDestroyed(destroyRef))
      .subscribe(({ product }) => {
        this.resetForm();
        this.showToast(`${product.name} was added to the catalog.`);
        this.loadProducts();
      });

    actions$
      .pipe(ofType(ProductActions.updateProductSuccess), takeUntilDestroyed(destroyRef))
      .subscribe(({ product }) => {
        this.resetForm();
        this.showToast(`${product.name} was updated.`);
        this.loadProducts();
      });

    actions$
      .pipe(ofType(ProductActions.deleteProductSuccess), takeUntilDestroyed(destroyRef))
      .subscribe(() => {
        this.productToDelete.set(null);
        this.showToast('Product removed from the catalog.');
        this.loadProducts();
      });

    destroyRef.onDestroy(() => {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
    });
  }

  ngOnInit() {
    this.loadProducts();
  }

  protected startCreating(formPanel: HTMLElement) {
    this.resetForm();
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected editProduct(product: Product, formPanel: HTMLElement) {
    this.editingProduct.set(product);
    this.productForm.reset({
      name: product.name,
      description: product.description ?? '',
      price: product.price,
      stock: product.stock,
    });
    this.store.dispatch(ProductActions.dismissError());
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected resetForm() {
    this.editingProduct.set(null);
    this.productForm.reset({ name: '', description: '', price: 0, stock: 0 });
    this.store.dispatch(ProductActions.dismissError());
  }

  protected submit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formValue = this.productForm.getRawValue();
    const product: ProductRequest = {
      name: formValue.name.trim(),
      description: formValue.description.trim() || null,
      price: Number(formValue.price),
      stock: Number(formValue.stock),
    };
    const existingProduct = this.editingProduct();

    if (existingProduct) {
      this.store.dispatch(ProductActions.updateProduct({ id: existingProduct.id, product }));
      return;
    }

    this.store.dispatch(ProductActions.createProduct({ product }));
  }

  protected askToDelete(product: Product) {
    this.productToDelete.set(product);
  }

  protected cancelDelete() {
    if (this.deletingId() === null) {
      this.productToDelete.set(null);
    }
  }

  protected confirmDelete() {
    const product = this.productToDelete();

    if (product) {
      this.store.dispatch(ProductActions.deleteProduct({ id: product.id }));
    }
  }

  protected retry() {
    this.loadProducts();
  }

  protected dismissError() {
    this.store.dispatch(ProductActions.dismissError());
  }

  protected searchProducts(value: string) {
    this.search.set(value);
    this.loadProducts();
  }

  protected clearSearch() {
    this.search.set('');
    this.loadProducts();
  }

  protected productInitial(product: Product) {
    return product.name.trim().charAt(0).toUpperCase() || '?';
  }

  private showToast(message: string) {
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }

    this.toast.set(message);
    this.toastTimer = setTimeout(() => this.toast.set(null), 3500);
  }

  private loadProducts() {
    this.store.dispatch(ProductActions.loadProducts({ search: this.search() }));
  }
}
