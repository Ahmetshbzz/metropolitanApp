//  "CombinedSummarySection.tsx"
//  metropolitan app

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { formatPrice } from "@/core/utils";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useProductsSection } from "@/hooks/useProductsSection";
import type { FullOrderPayload, OrderItem } from "@metropolitan/shared";
import { ProductItem } from "./ProductItem";

interface CombinedSummarySectionProps {
  orderData: FullOrderPayload;
}

export function CombinedSummarySection({
  orderData,
}: CombinedSummarySectionProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const { order, items } = orderData;
  const { getProductImage, handleProductPress } = useProductsSection(items);

  return (
    <View className="px-5 py-5">
      <View className="flex-row items-center mb-3">
        <Ionicons
          name="receipt-outline"
          size={20}
          color={colors.textSecondary}
        />
        <ThemedText className="font-semibold text-base ml-2">
          {t("order_detail.summary.section_title")}
        </ThemedText>
      </View>

      {/* Totals */}
      <View className="gap-y-2">
        <View className="flex-row justify-between items-center">
          <ThemedText className="opacity-80">
            {t("order_detail.summary.subtotal")}
          </ThemedText>
          <ThemedText className="font-medium">
            {formatPrice(order.totalAmount, order.currency)}
          </ThemedText>
        </View>
        <View className="flex-row justify-between items-center">
          <ThemedText className="opacity-80">
            {t("order_detail.summary.shipping")}
          </ThemedText>
          <ThemedText className="font-medium">
            {t("order_detail.summary.free_shipping")}
          </ThemedText>
        </View>
        <View
          className="my-1"
          style={{ borderTopWidth: 1, borderTopColor: colors.border + "50" }}
        />
        <View className="flex-row justify-between items-center">
          <ThemedText className="font-bold text-lg">
            {t("order_detail.summary.total")}
          </ThemedText>
          <ThemedText className="font-bold text-lg">
            {formatPrice(order.totalAmount, order.currency)}
          </ThemedText>
        </View>
      </View>

      {/* Products list (always visible) */}
      {items.length > 0 && (
        <View className="mt-3">
          {
            // En fazla 5 satır görünsün; fazlası içeride kaydırılsın
          }
          <ScrollView
            nestedScrollEnabled
            scrollEnabled={items.length > 5}
            style={{ maxHeight: items.length > 5 ? 56 * 5 : undefined }}
          >
            {items.map((item: OrderItem, idx: number) => (
              <ProductItem
                key={item.id}
                item={item}
                currency={order.currency}
                onPress={handleProductPress}
                getProductImage={getProductImage}
                showDivider={idx < items.length - 1}
                colors={colors}
                t={t}
              />
            ))}
          </ScrollView>
        </View>
      )}
      {/* Divider bottom */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </View>
  );
}
