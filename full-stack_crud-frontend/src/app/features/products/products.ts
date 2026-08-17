import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  private readonly actions$ = inject(Actions);
  private readonly destroyRef = inject(DestroyRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly store = inject(Store);
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly products = this.store.selectSignal(selectProducts);
  protected readonly loading = this.store.selectSignal(selectProductsLoading);
  protected readonly apiConnected = this.store.selectSignal(selectApiConnected);
  protected readonly saving = this.store.selectSignal(selectProductSaving);
  protected readonly deletingId = this.store.selectSignal(selectDeletingProductId);
  protected readonly error = this.store.selectSignal(selectProductsError);
  protected readonly unitsInStock = this.store.selectSignal(selectUnitsInStock);
  protected readonly lowStockCount = this.store.selectSignal(selectLowStockCount);
  protected readonly inventoryValue = this.store.selectSignal(selectInventoryValue);

  protected readonly search = signal('');
  protected readonly editingProduct = signal<Product | null>(null);
  protected readonly productToDelete = signal<Product | null>(null);
  protected readonly toast = signal<string | null>(null);

  protected readonly filteredProducts = computed(() => {
    const query = this.search().trim().toLowerCase();

    if (!query) {
      return this.products();
    }

    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query),
    );
  });

  protected readonly productForm = this.formBuilder.nonNullable.group({
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

  constructor() {
    this.actions$
      .pipe(ofType(ProductActions.createProductSuccess), takeUntilDestroyed())
      .subscribe(({ product }) => {
        this.resetForm();
        this.showToast(`${product.name} was added to the catalog.`);
      });

    this.actions$
      .pipe(ofType(ProductActions.updateProductSuccess), takeUntilDestroyed())
      .subscribe(({ product }) => {
        this.resetForm();
        this.showToast(`${product.name} was updated.`);
      });

    this.actions$
      .pipe(ofType(ProductActions.deleteProductSuccess), takeUntilDestroyed())
      .subscribe(() => {
        this.productToDelete.set(null);
        this.showToast('Product removed from the catalog.');
      });

    this.destroyRef.onDestroy(() => {
      if (this.toastTimer) {
        clearTimeout(this.toastTimer);
      }
    });
  }

  ngOnInit() {
    this.store.dispatch(ProductActions.loadProducts());
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
    this.store.dispatch(ProductActions.loadProducts());
  }

  protected dismissError() {
    this.store.dispatch(ProductActions.dismissError());
  }

  protected clearSearch() {
    this.search.set('');
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
}
