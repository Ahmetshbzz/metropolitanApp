//  "PurchaseSection.tsx"
//  metropolitan app
//  Created by Ahmet on 13.06.2025.

import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BaseButton } from "@/components/base/BaseButton";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useHaptics } from "@/hooks/useHaptics";
import { useToast } from "@/hooks/useToast";
import { StructuredError } from "@/types/error.types";
import type { Product } from "@metropolitan/shared";

interface PurchaseSectionProps {
  product: Product;
  quantity: string;
  onQuantityChange: (text: string) => void;
  onQuantityBlur: () => void;
  onUpdateQuantity: (amount: number) => void;
}

export function PurchaseSection({
  product,
  quantity,
  onQuantityChange,
  onQuantityBlur,
  onUpdateQuantity,
}: PurchaseSectionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  // Mock cart data
  const cartItems = [];
  const { showToast } = useToast();
  // const { triggerHaptic } = useHaptics();
  const router = useRouter();

  const [isAdded, setIsAdded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isQuickBuying, setIsQuickBuying] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup için useEffect
  useEffect(() => {
    return () => {
      // Component unmount olduğunda timeout'u temizle
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleAddToCart = async () => {
    setIsLoading(true);

    try {
      const numQuantity = parseInt(quantity, 10) || 1;

      const cartItem = cartItems.find((item) => item.product.id === product.id);
      const existingQuantity = cartItem ? cartItem.quantity : 0;

      if (existingQuantity === 0 && numQuantity > product.stock) {
        showToast(
          t("product_detail.purchase.stock_error_message", {
            count: product.stock,
          }),
          "warning"
        );
        throw new Error("Stock limit exceeded");
      }

      // Mock add to cart
      console.log('Add to cart:', product.id, numQuantity);
      showToast('Product added to cart', 'success');
      // Haptik sadece basış anında verilir; burada tetiklenmez

      if (!cartItem) {
        // Yeni ekleme ise geçici olarak "Sepete Eklendi" göster
        setIsAdded(true);

        // Önceki timeout'u temizle
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // Yeni timeout oluştur
        timeoutRef.current = setTimeout(() => {
          setIsAdded(false);
          timeoutRef.current = null;
        }, 2000);
      }
    } catch (err) {
      console.error("Sepete ekleme hatası:", err);
      const structuredError = err as StructuredError;

      // useCartState'ten gelen structured error'ı handle et
      if (structuredError.key) {
        // Structured error message'ı direkt kullan (zaten çevrilmiş)
        showToast(structuredError.message, "error");
      } else if (structuredError.code === "AUTH_REQUIRED") {
        // Auth error'ı handle et
        showToast(structuredError.message, "warning");
      } else {
        // Generic error
        showToast(t("product_detail.purchase.generic_error_message"), "error");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const numericQuantity = parseInt(quantity, 10) || 0;

  const handleQuickBuy = async () => {
    if (product.stock === 0 || numericQuantity === 0) return;
    setIsQuickBuying(true);
    try {
      const existing = cartItems.find((i) => i.product.id === product.id);
      const existingQty = existing ? existing.quantity : 0;
      if (!existing || existingQty !== numericQuantity) {
        // Mock add to cart for quick buy
        console.log('Quick buy add to cart:', product.id, numericQuantity);
      }
      router.push("/checkout");
    } catch {
      showToast(t("product_detail.purchase.generic_error_message"), "error");
    } finally {
      setIsQuickBuying(false);
    }
  };

  // Buton durumunu belirle
  const currentCartItem = cartItems.find(
    (item) => item.product.id === product.id
  );
  const isInCart = !!currentCartItem;
  const isSameQuantity =
    currentCartItem && currentCartItem.quantity === numericQuantity;

  return (
    <ThemedView
      className="px-5 pt-4 border-t"
      style={{
        paddingBottom: insets.bottom,
        borderTopColor: colors.borderColor,
        backgroundColor: colors.cardBackground,
      }}
    >
      <View className="flex-row items-center gap-3">
        <BaseButton
          variant="secondary"
          size="small"
          onPress={handleQuickBuy}
          disabled={
            product.stock === 0 || numericQuantity === 0 || isQuickBuying
          }
          loading={isQuickBuying}
          style={{ flex: 1 }}
        >
          <Text
            className="text-base font-bold"
            style={{ color: colors.primary }}
          >
            {t("product_detail.purchase.quick_buy")}
          </Text>
        </BaseButton>

        {isInCart && isSameQuantity ? (
          <BaseButton
            variant="success"
            size="small"
            hapticType="medium"
            onPress={() => {
              setIsNavigating(true);
              setTimeout(() => {
                router.push("/(tabs)/cart");
                setIsNavigating(false);
              }, 300);
            }}
            loading={isNavigating}
            disabled={isNavigating}
            style={{ flex: 1 }}
          >
            <Text className="text-base font-bold" style={{ color: "#FFFFFF" }}>
              {t("product_detail.purchase.go_to_cart")}
            </Text>
          </BaseButton>
        ) : (
          <BaseButton
            variant={isAdded ? "success" : "primary"}
            size="small"
            onPress={handleAddToCart}
            hapticType={isAdded ? "success" : "medium"}
            disabled={product.stock === 0 || numericQuantity === 0 || isLoading}
            loading={isLoading}
            style={{ flex: 1 }}
          >
            <Text className="text-base font-bold" style={{ color: "#FFFFFF" }}>
              {product.stock === 0
                ? t("product_detail.purchase.out_of_stock")
                : isAdded
                  ? t("product_detail.purchase.added_to_cart")
                  : isInCart
                    ? t("product_detail.purchase.update_cart")
                    : t("product_detail.purchase.add_to_cart")}
            </Text>
          </BaseButton>
        )}
      </View>
    </ThemedView>
  );
}
