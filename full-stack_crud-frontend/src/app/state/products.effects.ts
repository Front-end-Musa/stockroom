import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concat, concatMap, debounceTime, map, mergeMap, of, switchMap } from 'rxjs';

import { ProductService } from '../services/product.service';
import { ProductActions } from './products.actions';

interface ProblemDetails {
  title?: string;
  detail?: string;
  errors?: Record<string, string[]>;
}

@Injectable()
export class ProductEffects {
  private readonly actions$ = inject(Actions);
  private readonly productService = inject(ProductService);

  readonly loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.loadProducts),
      debounceTime(250),
      switchMap(({ search, page, pageSize }) => this.productService.getAll(search, 'createdAtUtc', 'desc', page, pageSize)),
      map((response) => ProductActions.loadProductsSuccess({ data: response })),
      catchError((error: unknown, effect$) =>
        concat(
          of(ProductActions.loadProductsFailure({ error: getErrorMessage(error) })),
          effect$,
        ),
      ),
    ),
  );

  readonly createProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.createProduct),
      concatMap(({ product }) => this.productService.create(product)),
      map((product) => ProductActions.createProductSuccess({ product })),
      catchError((error: unknown, effect$) =>
        concat(
          of(ProductActions.createProductFailure({ error: getErrorMessage(error) })),
          effect$,
        ),
      ),
    ),
  );

  readonly updateProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.updateProduct),
      concatMap(({ id, product }) =>
        this.productService
          .update(id, product)
          .pipe(map(() => ProductActions.updateProductSuccess({ id, product }))),
      ),
      catchError((error: unknown, effect$) =>
        concat(
          of(ProductActions.updateProductFailure({ error: getErrorMessage(error) })),
          effect$,
        ),
      ),
    ),
  );

  readonly deleteProduct$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProductActions.deleteProduct),
      mergeMap(({ id }) =>
        this.productService.delete(id).pipe(map(() => ProductActions.deleteProductSuccess({ id }))),
      ),
      catchError((error: unknown, effect$) =>
        concat(
          of(ProductActions.deleteProductFailure({ error: getErrorMessage(error) })),
          effect$,
        ),
      ),
    ),
  );
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Something went wrong. Please try again.';
  }

  if (error.status === 0) {
    return 'The product API is unavailable. Make sure it is running on port 5135.';
  }

  const problem = isProblemDetails(error.error) ? error.error : null;
  const validationMessage = problem?.errors
    ? Object.values(problem.errors).flat().at(0)
    : undefined;

  return (
    problem?.detail ??
    validationMessage ??
    problem?.title ??
    `The request failed with status ${error.status}.`
  );
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === 'object' && value !== null;
}
