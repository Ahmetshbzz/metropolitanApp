//  "useCartItem.ts"
//  metropolitan app
//  Created by Ahmet on 08.07.2025.

// NOTE: Context API kaldırıldı; Zustand store'ları kullanılacak
import type { CartItem as CartItemType } from "@metropolitan/shared";
// import { useCartStore } from "@/stores/cart/cartStore";
// import { useProductStore } from "@/stores/product/productStore";
import { useHaptics } from "@/hooks/useHaptics";
import { useTheme } from "@/hooks/useTheme";
import { useRouter } from "expo-router";

// Mock store hooks
const useCartStore = (selector: any) => {
  const mockCartState = {
    summary: {
      totalQuantity: 3,
      totalPrice: 150.00,
      subTotal: 120.00,
      tax: 20.00,
      shipping: 10.00
    }
  };
  
  if (typeof selector === 'function') {
    return selector(mockCartState);
  }
  return mockCartState;
};

const useProductStore = (selector: any) => {
  const mockProductState = {
    products: [
      {
        id: '1',
        name: 'Mock Product 1',
        price: 50.00,
        image: 'https://via.placeholder.com/150',
        description: 'Mock product description'
      },
      {
        id: '2', 
        name: 'Mock Product 2',
        price: 30.00,
        image: 'https://via.placeholder.com/150',
        description: 'Another mock product'
      }
    ]
  };
  
  if (typeof selector === 'function') {
    return selector(mockProductState);
  }
  return mockProductState;
};

export const useCartItem = (item: CartItemType) => {
  const { colors, colorScheme } = useTheme();
  const { triggerHaptic } = useHaptics();
  const products = useProductStore((s) => s?.products);
  const summary = useCartStore((s) => s?.summary);
  const router = useRouter();

  // Find the full product details from the ProductContext
  const product = products?.find((p) => p.id === item.product.id);

  if (!product) {
    return null;
  }

  const totalItemPrice = product.price * item.quantity;

  // Actions
  const handleProductPress = () => {
    router.push(`/product/${product.id}`);
  };

  const handleIncrement = (onUpdateQuantity: (quantity: number) => void) => {
    onUpdateQuantity(item.quantity + 1);
  };

  const handleDecrement = (onUpdateQuantity: (quantity: number) => void) => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.quantity - 1);
    }
  };

  const handleSwipeWillOpen = (direction: "left" | "right") => {
    // Hafif tek haptik
    triggerHaptic("light");
  };

  const handleDelete = (onRemove: () => void) => {
    triggerHaptic("medium");
    onRemove();
  };

  return {
    // Data
    product,
    totalItemPrice,
    colors,
    colorScheme,
    summary,

    // Actions
    handleProductPress,
    handleIncrement,
    handleDecrement,
    handleSwipeWillOpen,
    handleDelete,
  };
};
