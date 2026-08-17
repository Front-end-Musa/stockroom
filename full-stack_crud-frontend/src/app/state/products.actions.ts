import { createActionGroup, emptyProps, props } from '@ngrx/store';

import { ProductRequest } from '../contracts/product-request';
import { Product } from '../models/product';

export const ProductActions = createActionGroup({
  source: 'Products',
  events: {
    'Load Products': emptyProps(),
    'Load Products Success': props<{ products: Product[] }>(),
    'Load Products Failure': props<{ error: string }>(),
    'Create Product': props<{ product: ProductRequest }>(),
    'Create Product Success': props<{ product: Product }>(),
    'Create Product Failure': props<{ error: string }>(),
    'Update Product': props<{ id: number; product: ProductRequest }>(),
    'Update Product Success': props<{ id: number; product: ProductRequest }>(),
    'Update Product Failure': props<{ error: string }>(),
    'Delete Product': props<{ id: number }>(),
    'Delete Product Success': props<{ id: number }>(),
    'Delete Product Failure': props<{ error: string }>(),
    'Dismiss Error': emptyProps(),
  },
});
