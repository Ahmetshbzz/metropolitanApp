//  "TabBarBackground.ios.tsx"
//  metropolitan app
//  Created by Ahmet on 12.06.2025.

import { useColorScheme } from "@/hooks/useColorScheme";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet } from "react-native";

export default function BlurTabBarBackground() {
  const colorScheme = useColorScheme();

  return (
    <BlurView
      tint={colorScheme === "dark" ? "dark" : "light"}
      intensity={90}
      style={StyleSheet.absoluteFill}
    />
  );
}

export function useBottomTabOverflow() {
  try {
    return useBottomTabBarHeight();
  } catch {
    // Return 0 if not inside a tab navigator
    return 0;
  }
}
