//  "useProductCard.ts"
//  metropolitan app
//  Created by Ahmet on 05.07.2025.

// NOTE: Store'lar kaldırıldı, mock data kullanılıyor
import { useTheme } from "@/hooks/useTheme";
import { useToast } from "@/hooks/useToast";
import { getErrorMessageWithFallback } from "@/constants/errors";
import { Product } from "@metropolitan/shared";
// import { useRouter } from "expo-router";
import type { GestureResponderEvent } from "react-native";

export const useProductCard = (product: Product) => {
  const { colors, colorScheme } = useTheme();
  // Mock data and functions
  const cartItems = [];
  const isProductFavorite = false;
  const { showToast } = useToast();
  // const router = useRouter();

  // Computed values
  const isLowStock = product.stock < 10;
  const isOutOfStock = product.stock === 0;
  const isProductInCart = false;

  // Actions
  const handleAddToCart = async (e: GestureResponderEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Mock add to cart
    console.log('Add to cart:', product.id);
    showToast('Product added to cart', 'success');
  };

  const handleToggleFavorite = async () => {
    // Mock toggle favorite
    console.log('Toggle favorite:', product.id);
    showToast('Favorite toggled', 'info');
  };

  return {
    // State
    colors,
    colorScheme,
    isProductFavorite,
    isLowStock,
    isOutOfStock,
    isProductInCart,

    // Actions
    handleAddToCart,
    handleToggleFavorite,
  };
};
