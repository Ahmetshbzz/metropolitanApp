//  "AddressCard.tsx"
//  metropolitan app
//  Created by Ahmet on 29.06.2025.

import { useCartItemSwipeActions } from "@/components/cart/CartItemSwipeActions";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Animated, Text, TouchableOpacity, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useAddressActions } from "@/hooks/useAddressActions";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { Address } from "@metropolitan/shared";
import { AddressDefaultBadges } from "./AddressDefaultBadges";
import { AddressInfoLine } from "./AddressInfoLine";

interface AddressCardProps {
  address: Address;
}

export const AddressCard = ({ address }: AddressCardProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { handleEdit, handleDelete, handleSetDefault } =
    useAddressActions(address);
  const isDefault = address.isDefaultDelivery || address.isDefaultBilling;

  const { renderRightActions } = useCartItemSwipeActions({
    onDelete: handleDelete,
  });

  const renderLeftActions = (
    progress: Animated.AnimatedAddition<number>,
    dragX: Animated.AnimatedAddition<number>
  ) => {
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
      extrapolate: "clamp",
    });
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        className="justify-center items-center bg-blue-500 mx-4 mb-3 rounded-2xl"
        style={{ width: 88, transform: [{ scale }], opacity }}
      >
        <TouchableOpacity
          onPress={handleEdit}
          className="flex-1 justify-center items-center px-4"
        >
          <Ionicons name="create-outline" size={24} color="white" />
          <Text className="text-white text-xs mt-1 font-medium">Düzenle</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <Swipeable
      overshootRight={false}
      rightThreshold={40}
      friction={2}
      renderRightActions={renderRightActions}
      renderLeftActions={renderLeftActions}
    >
      <View className="px-5 py-5" style={{ position: "relative" }}>
        <View className="flex-row justify-between items-start mb-4">
          <View className="flex-1 mr-4">
            <ThemedText className="text-lg font-bold">
              {address.addressTitle}
            </ThemedText>
          </View>
          <View className="flex-row items-center gap-4">
            <TouchableOpacity onPress={handleSetDefault} hitSlop={10}>
              <Ionicons
                name={isDefault ? "star" : "star-outline"}
                size={24}
                color={isDefault ? colors.tint : colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="gap-3">
          <AddressInfoLine icon="location-outline" text={address.street} />
          <AddressInfoLine
            icon="map-outline"
            text={`${address.postalCode}, ${address.city}`}
          />
        </View>

        <AddressDefaultBadges
          isDeliveryDefault={address.isDefaultDelivery}
          isBillingDefault={address.isDefaultBilling}
        />

        {/* Divider */}
        <View
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 1, backgroundColor: colors.borderColor }}
        />
      </View>
    </Swipeable>
  );
};
