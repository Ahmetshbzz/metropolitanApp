//  "ProductCard.tsx"
//  metropolitan app
//  Created by Ahmet on 30.06.2025. Edited on 23.07.2025.

import type { Product } from "@metropolitan/shared";
import { useProductCard } from "@/hooks/useProductCard";
import { Link } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";
import { ProductCardContent } from "./ProductCardContent";
import { ProductCardImage } from "./ProductCardImage";

interface ProductCardProps {
  product: Product;
  variant?: "grid" | "horizontal";
  cardWidth?: number;
}

export const ProductCard = React.memo<ProductCardProps>(function ProductCard({
  product,
  variant = "grid",
  cardWidth,
}) {
  const { colors, colorScheme, isLowStock, isOutOfStock, handleAddToCart } =
    useProductCard(product);

  const isHorizontal = variant === "horizontal";

  return (
    <View
      className={isHorizontal ? "mr-3" : "mx-1 mb-2"}
      style={isHorizontal ? { width: cardWidth ?? 180 } : { width: "31.5%" }}
    >
      <Link
        href={{
          pathname: "/product/[id]",
          params: { id: product.id },
        }}
        asChild
      >
        <TouchableOpacity
          activeOpacity={0.9}
          className="overflow-hidden rounded-2xl border"
          style={{
            backgroundColor: colors.cardBackground,
            borderColor: colors.border,
            shadowColor: colorScheme === "dark" ? "#000" : colors.tint,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: colorScheme === "dark" ? 0.24 : 0.08,
            shadowRadius: 8,
            elevation: 3,
          }}
        >
          {/* Brand badge removed */}

          <ProductCardImage
            product={product}
            colorScheme={colorScheme}
            isOutOfStock={isOutOfStock}
            colors={colors}
          />

          <ProductCardContent
            product={product}
            colors={colors}
            colorScheme={colorScheme}
            isOutOfStock={isOutOfStock}
            isLowStock={isLowStock}
            handleAddToCart={handleAddToCart}
          />
        </TouchableOpacity>
      </Link>
    </View>
  );
});
