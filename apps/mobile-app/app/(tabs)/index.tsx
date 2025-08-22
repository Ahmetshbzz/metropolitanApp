//  "index.tsx"
//  metropolitan app
//  Created by Ahmet on 13.06.2025.

import { BaseButton } from "@/components/base/BaseButton";
import { useFocusEffect } from "@react-navigation/native";
import { Link } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";

import { HomeSlider } from "@/components/home/HomeSlider";
import { HomeSliderSkeleton } from "@/components/home/HomeSliderSkeleton";
import { ProductSection } from "@/components/home/ProductSection";
import { ProductSectionSkeleton } from "@/components/home/ProductSectionSkeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useScrollToTop } from "./_layout";

const MemoizedHomeScreenContent = React.memo(function HomeScreenContent() {
  const { t } = useTranslation();
  useColorScheme();

  // Mock data for UI rendering
  const mockProducts = [
    { id: '1', title: 'Sample Product 1', price: '29.99', image: null },
    { id: '2', title: 'Sample Product 2', price: '39.99', image: null },
    { id: '3', title: 'Sample Product 3', price: '19.99', image: null },
    { id: '4', title: 'Sample Product 4', price: '49.99', image: null },
    { id: '5', title: 'Sample Product 5', price: '59.99', image: null },
    { id: '6', title: 'Sample Product 6', price: '24.99', image: null },
    { id: '7', title: 'Sample Product 7', price: '34.99', image: null },
    { id: '8', title: 'Sample Product 8', price: '44.99', image: null },
  ];

  // Ana sayfa sadece normal kategorileri gösterir - arama yok
  const { featuredProducts, weeklyProducts, bestSellers, newArrivals } =
    useMemo(() => {
      return {
        featuredProducts: mockProducts.slice(0, 4),
        weeklyProducts: mockProducts.slice(2, 6),
        bestSellers: mockProducts.slice(4, 8),
        newArrivals: mockProducts.slice(1, 5),
      };
    }, []);

  return (
    <>
      <HomeSlider />
      <ProductSection
        title={t("home.featured_products")}
        products={featuredProducts}
      />
      <ProductSection
        title={t("home.weekly_products")}
        products={weeklyProducts}
      />
      <ProductSection title={t("home.bestsellers")} products={bestSellers} />
      <ProductSection title={t("home.new_arrivals")} products={newArrivals} />

      <View className="mt-6 px-2.5">
        <Link href="/(tabs)/products" asChild>
          <BaseButton
            variant="primary"
            size="small"
            title={t("home.see_all_products")}
            fullWidth
            style={{ marginTop: 8, marginBottom: 24 }}
          />
        </Link>
      </View>
    </>
  );
});

function HomeScreenSkeleton() {
  return (
    <>
      <HomeSliderSkeleton />
      <View className="pt-4">
        <ProductSectionSkeleton />
        <ProductSectionSkeleton />
        <ProductSectionSkeleton />
      </View>
    </>
  );
}

export default function HomeScreen() {
  const { paddingBottom } = useTabBarHeight();
  const [isRefreshing, setIsRefreshing] = useState(false);
  // Mock state for UI rendering
  const [loadingProducts] = useState(false);
  const [error] = useState(null);
  const mockProducts = [
    { id: '1', title: 'Sample Product 1', price: '29.99', image: null },
    { id: '2', title: 'Sample Product 2', price: '39.99', image: null },
    { id: '3', title: 'Sample Product 3', price: '19.99', image: null },
    { id: '4', title: 'Sample Product 4', price: '49.99', image: null },
  ];

  const { registerScrollHandler, unregisterScrollHandler } = useScrollToTop();
  const scrollViewRef = useRef<ScrollView>(null);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Ana sayfa artık kendi arama state'ini kullanıyor - global search kaldırıldı

  // Scroll-to-top handler'ı kaydet
  useEffect(() => {
    const scrollToTop = () => {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    };

    registerScrollHandler("index", scrollToTop);

    return () => {
      unregisterScrollHandler("index");
    };
  }, [registerScrollHandler, unregisterScrollHandler]);

  // Tab focus olduğunda refreshing state'ini sıfırla
  useFocusEffect(
    useCallback(() => {
      // Tab'a odaklanıldığında refreshing state'ini sıfırla
      setIsRefreshing(false);
    }, [])
  );

  useEffect(() => {
    // Mock effect - no actual API calls
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Mock refresh - simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const showSkeleton = loadingProducts && mockProducts.length === 0;
  const showErrorOverlay = !!(
    error &&
    mockProducts.length === 0 &&
    !loadingProducts
  );

  return (
    <View className="flex-1">
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: 10,
          paddingHorizontal: 6,
          paddingBottom,
        }}
        scrollEnabled={!showErrorOverlay}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.tint}
          />
        }
      >
        {showSkeleton || showErrorOverlay ? (
          <HomeScreenSkeleton />
        ) : (
          <MemoizedHomeScreenContent />
        )}
      </ScrollView>
      {showErrorOverlay && (
        <ErrorState message={error as string} onRetry={handleRefresh} />
      )}
    </View>
  );
}
