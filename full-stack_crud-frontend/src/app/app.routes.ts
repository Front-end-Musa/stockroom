import { Routes } from '@angular/router';

import { Products } from './features/products/products';

export const routes: Routes = [
  {
    path: '',
    component: Products,
    title: 'Stockroom — Product inventory',
  },
  {
    path: '**',
    redirectTo: '',
  },
];
