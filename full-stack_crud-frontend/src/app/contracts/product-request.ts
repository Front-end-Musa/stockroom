import { Product } from '../models/product';

export type ProductRequest = Pick<Product, 'name' | 'description' | 'price' | 'stock'>;
