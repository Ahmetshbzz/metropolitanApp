//  "InitialLayout.tsx"
//  metropolitan app
//  Created by Ahmet on 11.06.2025. Updated on 21.07.2025.

import { useColorScheme } from "@/hooks/useColorScheme";
// Mock FCM initialization
const initializeFCM = () => {
  console.log("Mock: FCM initialized");
  return Promise.resolve();
};
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { View } from "react-native";

import { NavigationStack } from "./NavigationStack";

export const InitialLayout: React.FC = () => {
  const [loaded, error] = useFonts({
    // Diğer fontlar
  });
  const colorScheme = useColorScheme();

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      // FCM'i başlat
      initializeFCM().catch((error) => {
        console.error("❌ FCM başlatılamadı:", error);
      });
    }
  }, [loaded]);

  // Font yüklenmemişse null döndür (expo splash scren görünür)
  if (!loaded) {
    return null;
  }

  return (
    <View
      className={colorScheme === "dark" ? "flex-1 dark vars" : "flex-1 vars"}
      style={{ flex: 1 }}
    >
      <NavigationStack />
    </View>
  );
};
