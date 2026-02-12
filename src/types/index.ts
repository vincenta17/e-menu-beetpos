// Types for E-Menu Beetpos

export type Category = 'food' | 'drink' | 'combo';

export interface ProductSize {
  name: string;
  label: string;
  priceAdd: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: Category;
  sizes?: ProductSize[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  notes?: string;
}

export type OrderMode = 'DINEIN' | 'TAKEAWAY';

export interface CartState {
  items: CartItem[];
  tableNumber: string | null;
  tableName: string | null;
  outletId: string | null;
  tenantId: string | null;
  orderMode: OrderMode | null;
}
