//  "OrderTotals.tsx"
//  metropolitan app
//  Created by Ahmet on 15.07.2025.
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { View as RNView, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { getAppCurrency } from "@/core/currency";
import { formatPrice } from "@/core/utils";
import { useColorScheme } from "@/hooks/useColorScheme";
export function OrderTotals() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  
  // Mock cart summary
  const summary = {
    subtotal: 89.97,
    tax: 7.20,
    shipping: 9.99,
    total: 107.16
  };
  
  // Mock cart items
  const cartItems = [
    { id: "1", name: "Product 1", price: 29.99, quantity: 1 },
    { id: "2", name: "Product 2", price: 39.99, quantity: 1 },
    { id: "3", name: "Product 3", price: 19.99, quantity: 1 }
  ];

  const [open, setOpen] = useState(false);
  if (!summary) {
    return null;
  }

  return (
    <RNView className="px-5 py-5" style={{ position: "relative" }}>
      <TouchableOpacity
        activeOpacity={0.7}
        className="flex-row items-center justify-between mb-3"
        onPress={() => setOpen((v) => !v)}
      >
        <View className="flex-row items-center">
          <Ionicons
            name="receipt-outline"
            size={20}
            color={colors.textSecondary}
          />
          <ThemedText className="font-semibold text-base ml-2">
            {t("checkout.order_summary")}
          </ThemedText>
        </View>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
      <View className="gap-y-2">
        <View className="flex-row justify-between items-center">
          <ThemedText className="opacity-80">
            {t("checkout.subtotal")} ({summary?.totalItems || 0}{" "}
            {t("checkout.items")})
          </ThemedText>
          <ThemedText className="font-medium">
            {formatPrice(
              summary?.totalAmount || 0,
              summary?.currency || getAppCurrency()
            )}
          </ThemedText>
        </View>
        <View className="flex-row justify-between items-center">
          <ThemedText className="opacity-80">
            {t("checkout.shipping")}
          </ThemedText>
          <ThemedText className="font-medium text-green-600">
            {t("checkout.free")}
          </ThemedText>
        </View>
        <View
          className="my-1"
          style={{
            borderTopWidth: 1,
            borderTopColor: colors.border + "50",
          }}
        />
        <View className="flex-row justify-between items-center">
          <ThemedText className="font-bold text-lg">
            {t("checkout.total")}
          </ThemedText>
          <ThemedText className="font-bold text-lg">
            {formatPrice(
              summary?.totalAmount || 0,
              summary?.currency || getAppCurrency()
            )}
          </ThemedText>
        </View>
      </View>

      {open && cartItems?.length > 0 && (
        <View
          className="mt-3 rounded-xl overflow-hidden border"
          style={{ borderColor: colors.border }}
        >
          {cartItems.map((it: any, idx: number) => (
            <View
              key={it?.id || it?.product?.id || idx}
              className="flex-row items-center justify-between px-3 py-2"
              style={{
                borderBottomWidth: idx === cartItems.length - 1 ? 0 : 1,
                borderColor: colors.border,
              }}
            >
              <ThemedText
                className="text-sm"
                numberOfLines={1}
                style={{ flex: 1 }}
              >
                {it?.product?.name || "Ürün adı bulunamadı"}
              </ThemedText>
              <ThemedText
                className="text-sm mx-2"
                style={{ color: colors.textSecondary }}
              >
                x{it?.quantity || 0}
              </ThemedText>
              <ThemedText className="text-sm font-semibold">
                {formatPrice(
                  (typeof it?.totalPrice === "number"
                    ? it.totalPrice
                    : (it?.product?.price || 0) * (it?.quantity || 0)) || 0,
                  summary?.currency || getAppCurrency()
                )}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
      <RNView
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </RNView>
  );
}
