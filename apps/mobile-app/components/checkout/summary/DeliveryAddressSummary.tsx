//  "DeliveryAddressSummary.tsx"
//  metropolitan app
//  Created by Ahmet on 15.07.2025.
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View , View as RNView } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useCheckoutStore } from "@/stores";

// Mock checkout store
const useCheckoutStore = (selector: any) => {
  const mockCheckoutState = {
    deliveryAddress: {
      id: 'mock-address-1',
      addressTitle: 'Home Address',
      street: '123 Test Street',
      city: 'Test City',
      postalCode: '12345'
    }
  };
  
  if (typeof selector === 'function') {
    return selector(mockCheckoutState);
  }
  return mockCheckoutState;
};

export function DeliveryAddressSummary() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const deliveryAddress = useCheckoutStore((s) => s?.deliveryAddress);

  return (
    <RNView className="px-5 py-5" style={{ position: "relative" }}>
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
          <Ionicons
            name="location-outline"
            size={20}
            color={colors.textSecondary}
          />
          <ThemedText className="font-semibold text-base ml-2">
            {t("checkout.delivery_address")}
          </ThemedText>
        </View>
        <TouchableOpacity onPress={() => router.push("/checkout/address")}>
          <ThemedText
            className="text-sm font-medium"
            style={{ color: colors.tint }}
          >
            {t("common.change")}
          </ThemedText>
        </TouchableOpacity>
      </View>
      {deliveryAddress && (
        <View>
          <ThemedText className="font-medium">
            {deliveryAddress?.addressTitle || t("common.no_title")}
          </ThemedText>
          <ThemedText className="text-sm opacity-80 mt-1">
            {[
              deliveryAddress?.street,
              deliveryAddress?.city,
              deliveryAddress?.postalCode,
            ]
              .filter(Boolean)
              .join(", ") || t("common.no_address_details")}
          </ThemedText>
        </View>
      )}
      <RNView
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </RNView>
  );
}
