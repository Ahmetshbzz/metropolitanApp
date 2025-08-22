//  "SimilarProductsSection.tsx"
//  metropolitan app
//  Created by Assistant on 26.07.2025.

import { ProductCard } from "@/components/products/ProductCard";
import { ThemedText } from "@/components/ThemedText";
import type { Product } from "@metropolitan/shared";
import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Dimensions, FlatList, ListRenderItem, View } from "react-native";

interface SimilarProductsSectionProps {
  products: Product[];
  title?: string;
}

export function SimilarProductsSection({
  products,
  title,
}: SimilarProductsSectionProps) {
  const { width } = Dimensions.get("window");
  const { t } = useTranslation();

  const horizontalPadding = 8;
  // Kart horizontal varyantı zaten mr-3 (12) boşluk veriyor; hesaplamada onu kullan
  const gap = 12;
  const visibleCount = 3;

  const cardWidth = useMemo(() => {
    const totalGaps = gap * (visibleCount - 1);
    const totalHorizontal = horizontalPadding * 2 + totalGaps;
    const w = Math.floor((width - totalHorizontal) / visibleCount);
    return w;
  }, [width]);

  const listRef = useRef<FlatList<Product>>(null);

  const renderItem: ListRenderItem<Product> = ({ item }) => (
    <ProductCard product={item} variant="horizontal" cardWidth={cardWidth} />
  );

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between mb-3 px-3">
        <ThemedText type="subtitle" className="text-lg font-semibold">
          {title ?? t("product_detail.similar_products")}
        </ThemedText>
      </View>

      <FlatList
        ref={listRef}
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: horizontalPadding }}
      />
    </View>
  );
}
