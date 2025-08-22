//  "products.tsx"
//  metropolitan app
//  Created by Ahmet on 16.06.2025.

import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";

import { CategoryFilter } from "@/components/products/CategoryFilter";
import { ProductGrid, ProductGridRef } from "@/components/products/ProductGrid";
import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useScrollToTop } from "./_layout";

export default function ProductsScreen() {
  // Mock data for UI rendering
  const mockProducts = [
    { id: '1', title: 'Sample Product 1', price: '29.99', category: 'category_1' },
    { id: '2', title: 'Sample Product 2', price: '39.99', category: 'category_2' },
    { id: '3', title: 'Sample Product 3', price: '19.99', category: 'category_1' },
    { id: '4', title: 'Sample Product 4', price: '49.99', category: 'category_3' },
  ];
  const products = mockProducts;
  const filteredProducts = mockProducts;
  const loadingProducts = false;
  const error = null;
  const categories = [
    { id: 'category_1', name: 'Category 1', slug: 'category-1' },
    { id: 'category_2', name: 'Category 2', slug: 'category-2' },
    { id: 'category_3', name: 'Category 3', slug: 'category-3' },
  ];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const searchQuery = '';
  const { registerScrollHandler, unregisterScrollHandler } = useScrollToTop();
  const { paddingBottom } = useTabBarHeight();
  const productGridRef = useRef<ProductGridRef>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock effect - no actual search synchronization
  useEffect(() => {
    // No actual search synchronization
  }, [searchQuery]);

  useEffect(() => {
    // Mock effect - no actual API calls
  }, [selectedCategory]);

  const handleCategoryPress = useCallback(
    (slug: string) => {
      const newCategory = selectedCategory === slug ? null : slug;
      setSelectedCategory(newCategory);
      // Mock category selection - no actual API call
      console.log('Category selected:', newCategory);
    },
    [selectedCategory, setSelectedCategory]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Mock refresh - simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [selectedCategory]);

  // Scroll-to-top handler'ı kaydet
  useEffect(() => {
    const scrollToTop = () => {
      productGridRef.current?.scrollToTop();
    };

    registerScrollHandler("products", scrollToTop);

    return () => {
      unregisterScrollHandler("products");
    };
  }, [registerScrollHandler, unregisterScrollHandler]);

  // Tab focus olduğunda refreshing state'ini sıfırla
  useFocusEffect(
    useCallback(() => {
      // Tab'a odaklanıldığında refreshing state'ini sıfırla
      setIsRefreshing(false);
    }, [])
  );

  const showSkeleton = loadingProducts && products.length === 0;
  const showErrorOverlay = !!(
    error &&
    products.length === 0 &&
    !loadingProducts
  );

  return (
    <View className="flex-1">
      {showSkeleton || showErrorOverlay ? (
        <>
          <CategoryFilter
            categories={categories}
            activeCategory={selectedCategory}
            onCategoryPress={handleCategoryPress}
          />
          <ProductGridSkeleton />
        </>
      ) : (
        <ProductGrid
          ref={productGridRef}
          products={filteredProducts}
          ListHeaderComponent={
            <CategoryFilter
              categories={categories}
              activeCategory={selectedCategory}
              onCategoryPress={handleCategoryPress}
            />
          }
          onRefresh={handleRefresh}
          refreshing={isRefreshing}
          contentContainerStyle={{
            paddingBottom,
          }}
        />
      )}

      {showErrorOverlay && (
        <ErrorState
          message={error as string}
          onRetry={() => console.log('Retry products fetch')}
        />
      )}
    </View>
  );
}
