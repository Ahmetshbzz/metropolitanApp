//  "ProductInfo.tsx"
//  metropolitan app
//  Created by Ahmet on 15.06.2025.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { TextInput, TouchableOpacity, View } from "react-native";

import { BaseCard } from "@/components/base/BaseCard";
import { HapticIconButton } from "@/components/HapticButton";
import {
  ProductDetailsSheet,
  ProductDetailsSheetRef,
} from "@/components/product-detail/ProductDetailsSheet";
import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { formatPrice } from "@/core/utils";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { Product } from "@metropolitan/shared";

interface ProductInfoProps {
  product: Product | null;
  quantity: string;
  onQuantityChange: (text: string) => void;
  onQuantityBlur: () => void;
  onUpdateQuantity: (amount: number) => void;
}

export function ProductInfo({
  product,
  quantity,
  onQuantityChange,
  onQuantityBlur,
  onUpdateQuantity,
}: ProductInfoProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const detailsRef = React.useRef<ProductDetailsSheetRef>(null);

  const numericQuantity = parseInt(quantity, 10) || 0;

  if (!product) {
    return null; // or a loading indicator
  }

  return (
    <BaseCard padding={16} style={{ marginHorizontal: 12, marginTop: -20 }}>
      <View className="mb-3 flex-row items-start justify-between">
        <View style={{ flex: 1, paddingRight: 12 }}>
          <ThemedText
            className="font-semibold"
            style={{
              letterSpacing: -0.3,
              fontSize: 22,
              lineHeight: 28,
              color: colors.text,
            }}
          >
            {product.name}
          </ThemedText>
          <ThemedText
            className="mt-1 uppercase tracking-wide"
            style={{ color: colors.darkGray, fontSize: 11 }}
          >
            {t(`brands.${product.brand.toLowerCase()}`)}
          </ThemedText>
          {/* Product details link under brand */}
          <View className="mt-2 self-start">
            <View>
              <View className="flex-row items-center">
                <View className="rounded-full" style={{ display: "none" }} />
              </View>
            </View>
          </View>

          <View className="mt-2 self-start">
            <TouchableOpacity
              activeOpacity={0.7}
              className="flex-row items-center"
              onPress={() => detailsRef.current?.present()}
            >
              <ThemedText
                className="text-[13px] font-semibold"
                style={{ color: colors.tint }}
              >
                {t("product_detail.details")}
              </ThemedText>
              <View className="ml-2 w-5 h-5 rounded-full items-center justify-center bg-black/5 dark:bg-white/10">
                <Ionicons
                  name="information-outline"
                  size={12}
                  color={colors.tint}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <ThemedText
            className="font-extrabold"
            style={{ fontSize: 22, lineHeight: 26, color: colors.primary }}
          >
            {formatPrice(product.price, product.currency)}
          </ThemedText>

          {product.stock > 0 && (
            <View className="mt-2">
              {/* Quantity label removed per request */}
              <View
                className="flex-row items-center rounded-full border"
                style={{
                  borderColor: colors.borderColor,
                  backgroundColor: colors.cardBackground,
                  alignSelf: "flex-end",
                  height: 40,
                  paddingHorizontal: 0,
                  overflow: "hidden",
                }}
              >
                <HapticIconButton
                  className="items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)",
                  }}
                  onPress={() => onUpdateQuantity(-1)}
                  hapticType="light"
                  disabled={numericQuantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={16}
                    color={
                      numericQuantity <= 1 ? colors.mediumGray : colors.darkGray
                    }
                  />
                </HapticIconButton>
                <TextInput
                  className="font-semibold text-center"
                  style={{
                    color: colors.text,
                    flex: 1,
                    minWidth: 34,
                    height: "100%",
                    textAlignVertical: "center",
                    paddingVertical: 0,
                    includeFontPadding: false,
                    lineHeight: 20,
                    fontSize: 16,
                    backgroundColor: "transparent",
                  }}
                  value={quantity}
                  onChangeText={onQuantityChange}
                  onBlur={onQuantityBlur}
                  keyboardType="number-pad"
                  maxLength={3}
                  selectTextOnFocus
                />
                <HapticIconButton
                  className="items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor:
                      colorScheme === "dark"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(0,0,0,0.04)",
                  }}
                  onPress={() => onUpdateQuantity(1)}
                  hapticType="light"
                  disabled={numericQuantity >= product.stock}
                >
                  <Ionicons
                    name="add"
                    size={16}
                    color={
                      numericQuantity >= product.stock
                        ? colors.mediumGray
                        : colors.darkGray
                    }
                  />
                </HapticIconButton>
              </View>
            </View>
          )}
        </View>
      </View>

      {/* Stock and category rows removed as requested; stock will be shown near the image */}
      <ProductDetailsSheet ref={detailsRef} />
    </BaseCard>
  );
}
