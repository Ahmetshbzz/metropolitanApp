//  "AddressSection.tsx"
//  metropolitan app
//  Created by Ahmet on 25.06.2025.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { BaseButton } from "@/components/base/BaseButton";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHaptics } from "@/hooks/useHaptics";
import type { Address } from "@metropolitan/shared";

interface AddressSectionProps {
  title: string;
  addresses: Address[];
  selectedAddressId?: string;
  onSelectAddress: (address: Address) => void;
  showAddButton?: boolean;
}

export const AddressSection = ({
  title,
  addresses,
  selectedAddressId,
  onSelectAddress,
  showAddButton = true,
}: AddressSectionProps) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { withHapticFeedback } = useHaptics();

  const renderAddressRow = (address: Address, isSelected: boolean) => (
    <Pressable
      key={address.id}
      onPress={withHapticFeedback(() => onSelectAddress(address))}
      android_ripple={{ color: "transparent" }}
      style={{ marginBottom: 0 }}
    >
      <View
        className="px-5 py-4 flex-row items-start justify-between"
        style={{ position: "relative" }}
      >
        <View className="flex-1 pr-3">
          <ThemedText className="font-semibold text-base" numberOfLines={1}>
            {address.addressTitle}
          </ThemedText>
          <ThemedText className="opacity-70 leading-5 mt-1" numberOfLines={2}>
            {address.street}, {address.city}, {address.postalCode}
          </ThemedText>
        </View>
        <Ionicons
          name={isSelected ? "checkmark-circle" : "ellipse-outline"}
          size={22}
          color={isSelected ? colors.tint : colors.mediumGray}
        />
        <View
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 1, backgroundColor: colors.borderColor }}
        />
      </View>
    </Pressable>
  );

  return (
    <View>
      <ThemedText className="text-lg font-semibold mb-4">{title}</ThemedText>

      {addresses.map((address) =>
        renderAddressRow(address, selectedAddressId === address.id)
      )}

      {showAddButton && (
        <BaseButton
          variant="secondary"
          size="small"
          title={`+ ${t("checkout.add_new_address")}`}
          onPress={() => router.push("/add-address")}
          style={{ marginTop: 8 }}
        />
      )}
    </View>
  );
};
