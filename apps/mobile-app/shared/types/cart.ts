import type { Product } from "./product";

export interface CartItem {
  id: string;
  quantity: number;
  totalPrice?: number | string;
  createdAt?: string;
  product: Product;
}

export interface CartSummary {
  totalItems: number;
  totalAmount: number | string;
  currency?: string;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartOperationResponse {
  message: string;
  cartSummary: CartSummary;
  itemId?: string;
}


