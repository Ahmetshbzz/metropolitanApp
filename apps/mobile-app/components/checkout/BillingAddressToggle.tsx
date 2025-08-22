//  "BillingAddressToggle.tsx"
//  metropolitan app
//  Created by Ahmet on 25.06.2025.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Switch, View , View as RNView } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

interface BillingAddressToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const BillingAddressToggle = ({
  value,
  onValueChange,
}: BillingAddressToggleProps) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <RNView className="px-5 py-5" style={{ position: "relative" }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Ionicons
            name="document-text-outline"
            size={20}
            color={colors.textSecondary}
          />
          <ThemedText className="ml-2 font-medium">
            {t("checkout.same_billing_address")}
          </ThemedText>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: colors.border, true: colors.tint }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
        />
      </View>
      <RNView
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </RNView>
  );
};
