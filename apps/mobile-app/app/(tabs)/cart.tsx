//  "cart.tsx"
//  metropolitan app
//  Created by Ahmet on 26.06.2025.

import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";

import { CartContent } from "@/components/cart/CartContent";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { ThemedView } from "@/components/ThemedView";
import { useToast } from "@/hooks/useToast";

export default function CartScreen() {
  // Mock data for UI rendering
  const cartItems = [
    {
      id: '1',
      product: { id: '1', title: 'Sample Product 1', price: '29.99' },
      quantity: 2,
      variant_id: 'variant_1'
    },
    {
      id: '2', 
      product: { id: '2', title: 'Sample Product 2', price: '39.99' },
      quantity: 1,
      variant_id: 'variant_2'
    }
  ];
  const summary = {
    subtotal: 99.97,
    shipping: 10.00,
    tax: 15.50,
    total: 125.47,
    totalAmount: 125.47,
    totalItems: cartItems.length,
    currency: 'TRY'
  };
  const isLoading = false;
  const isAuthenticated = true;
  const { t } = useTranslation();
  const router = useRouter();
  const { showToast } = useToast();

  const handleRemoveItem = async (itemId: string) => {
    // Mock function - no actual operation
    console.log('Remove item:', itemId);
  };

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    // Mock function - no actual operation
    console.log('Update quantity:', itemId, quantity);
  };

  const handleCheckoutPress = () => {
    if (!isAuthenticated) {
      router.push("/(auth)?from=checkout");
      return;
    }
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator />
      </ThemedView>
    );
  }

  if (cartItems.length === 0 || !summary) {
    return (
      <ThemedView className="flex-1">
        <EmptyCart />
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <CartContent
        cartItems={cartItems}
        summary={summary}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckoutPress}
        isCheckingOut={false}
      />
    </ThemedView>
  );
}
