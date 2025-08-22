//  "_layout.tsx"
//  metropolitan app
//  Created by Ahmet on 04.07.2025.

import { useMemo } from "react";

import { useTabScreenOptions } from "@/components/tabs/TabScreenOptions";
import { TabScreens } from "@/components/tabs/TabScreens";
import { useTabLayout } from "@/hooks/useTabLayout";

export default function TabLayout() {
  // Mock cart count
  const cartItemCount = 0;

  const {
    scrollToTop,
    handleClearCart,
    handleNotification,
    getTabBarHeight,
    getTabBarPaddingBottom,
  } = useTabLayout();

  const screenOptions = useTabScreenOptions(
    getTabBarHeight,
    getTabBarPaddingBottom
  );

  // Memoize screenOptions to prevent re-renders
  const memoizedScreenOptions = useMemo(() => screenOptions, [screenOptions]);

  return (
    <TabScreens
      cartItemCount={cartItemCount}
      handleClearCart={handleClearCart}
      handleNotification={handleNotification}
      scrollToTop={scrollToTop}
      screenOptions={memoizedScreenOptions}
    />
  );
}

// Create useScrollToTop hook from useTabLayout
export const useScrollToTop = () => {
  const { scrollToTop, registerScrollHandler, unregisterScrollHandler } = useTabLayout();
  return { scrollToTop, registerScrollHandler, unregisterScrollHandler };
};
