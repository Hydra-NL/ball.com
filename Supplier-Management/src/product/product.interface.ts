import { Supplier } from '../supplier/supplier.interface';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  supplier: Supplier;
}
