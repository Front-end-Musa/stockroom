import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, Signal, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';

import { ProductRequest } from '../../contracts/product-request';
import { Product } from '../../models/product';
import { ProductActions } from '../../state/products.actions';
import { ProductsFacade } from '../../state/products.facade';

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
  protected readonly page: Signal<number>;
  protected readonly pageSize: Signal<number>;
  protected readonly totalItems: Signal<number>;
  protected readonly totalPages: Signal<number>;
  protected readonly hasPreviousPage: Signal<boolean>;
  protected readonly hasNextPage: Signal<boolean>;

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
    private readonly productsFacade: ProductsFacade,
    actions$: Actions,
    destroyRef: DestroyRef,
    formBuilder: FormBuilder,
  ) {
    this.products = productsFacade.products;
    this.loading = productsFacade.loading;
    this.apiConnected = productsFacade.apiConnected;
    this.saving = productsFacade.saving;
    this.deletingId = productsFacade.deletingId;
    this.error = productsFacade.error;
    this.unitsInStock = productsFacade.unitsInStock;
    this.lowStockCount = productsFacade.lowStockCount;
    this.inventoryValue = productsFacade.inventoryValue;
    this.page = productsFacade.page;
    this.pageSize = productsFacade.pageSize;
    this.totalItems = productsFacade.totalItems;
    this.totalPages = productsFacade.totalPages;
    this.hasPreviousPage = productsFacade.hasPreviousPage;
    this.hasNextPage = productsFacade.hasNextPage;
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
        this.loadProducts(1);
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
        const targetPage =
          this.products().length === 0 && this.page() > 1 ? this.page() - 1 : this.page();

        this.loadProducts(targetPage);
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
    this.productsFacade.dismissError();
    formPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected resetForm() {
    this.editingProduct.set(null);
    this.productForm.reset({ name: '', description: '', price: 0, stock: 0 });
    this.productsFacade.dismissError();
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
      this.productsFacade.updateProduct(existingProduct.id, product);
      return;
    }

    this.productsFacade.createProduct(product);
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
      this.productsFacade.deleteProduct(product.id);
    }
  }

  protected retry() {
    this.loadProducts();
  }

  protected dismissError() {
    this.productsFacade.dismissError();
  }

  protected searchProducts(value: string) {
    this.search.set(value);
    this.loadProducts(1);
  }

  protected clearSearch() {
    this.search.set('');
    this.loadProducts(1);
  }

  protected goToPreviousPage() {
    if (this.hasPreviousPage() && !this.loading()) {
      this.loadProducts(this.page() - 1);
    }
  }

  protected goToNextPage() {
    if (this.hasNextPage() && !this.loading()) {
      this.loadProducts(this.page() + 1);
    }
  }

  protected changePageSize(value: string | number) {
    const pageSize = Number(value);

    if (
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100 ||
      pageSize === this.pageSize()
    ) {
      return;
    }

    this.loadProducts(1, pageSize);
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

  private loadProducts(page = this.page(), pageSize = this.pageSize()) {
    this.productsFacade.loadProducts(this.search(), page, pageSize);
  }
}
