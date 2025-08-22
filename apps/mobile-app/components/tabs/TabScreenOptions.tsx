//  "TabScreenOptions.tsx"
//  metropolitan app
//  Created by Ahmet on 15.06.2025.

import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useTheme } from "@/hooks/useTheme";
import { Platform, StyleSheet } from "react-native";
import { useMemo } from "react";

export const useTabScreenOptions = (
  getTabBarHeight: () => number,
  getTabBarPaddingBottom: () => number
) => {
  const { colors, colorScheme } = useTheme();

  return useMemo(() => ({
    tabBarActiveTintColor: colors.tint,
    tabBarInactiveTintColor:
      Platform.OS === "ios"
        ? colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.6)"
          : "rgba(0, 0, 0, 0.6)"
        : colorScheme === "dark"
          ? "rgba(255, 255, 255, 0.65)"
          : "rgba(0, 0, 0, 0.65)",
    tabBarHideOnKeyboard: true,
    tabBarShowLabel: true,
    headerShown: true,
    headerStyle: {
      backgroundColor: colors.background,
      shadowColor: "transparent",
      elevation: 0,
    },
    headerTintColor: colors.text,
    headerTitleAlign: "center" as const,
    headerTitleStyle: {
      fontWeight: "600" as const,
      fontSize: 17,
      color: colors.text,
    },
    tabBarButton: HapticTab,
    tabBarBackground: TabBarBackground,
    tabBarStyle: {
      position: "absolute" as const,
      backgroundColor: "transparent",
      borderTopWidth: 0,
      elevation: 0,
      shadowOpacity: 0,
      borderRadius: 22,
      overflow: "hidden" as const,
      marginHorizontal: 16,
      marginBottom: Platform.OS === "ios" ? 8 : 10,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor:
        colorScheme === "dark"
          ? "rgba(84, 84, 88, 0.35)"
          : "rgba(60, 60, 67, 0.18)",
      height: getTabBarHeight(),
      paddingBottom: getTabBarPaddingBottom(),
      paddingTop: Platform.OS === "ios" ? 4 : 6,
    },
    tabBarLabelStyle: {
      fontSize: Platform.OS === "ios" ? 10 : 11,
      fontWeight: "600" as const,
      marginTop: Platform.OS === "ios" ? 2 : 3,
      letterSpacing: -0.2,
    },
    tabBarItemStyle: {
      paddingVertical: Platform.OS === "ios" ? 4 : 2,
    },
    tabBarIconStyle: {
      marginTop: Platform.OS === "ios" ? 2 : 1,
    },
  }), [colors, colorScheme, getTabBarHeight, getTabBarPaddingBottom]);
};
