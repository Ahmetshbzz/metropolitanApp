//  "DeliveryAndPaymentSummary.tsx"
//  metropolitan app

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View , View as RNView } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useCheckoutStore } from "@/stores";
import { useRouter } from "expo-router";

// Mock checkout store
const useCheckoutStore = (selector: any) => {
  const mockCheckoutState = {
    deliveryAddress: {
      id: 'mock-address-1',
      addressTitle: 'Home Address',
      street: '123 Test Street',
      city: 'Test City',
      postalCode: '12345'
    },
    selectedPaymentMethod: {
      id: 'card',
      title: 'Credit Card',
      subtitle: 'Visa ending in 1234',
      icon: 'card-outline'
    }
  };
  
  if (typeof selector === 'function') {
    return selector(mockCheckoutState);
  }
  return mockCheckoutState;
};

export function DeliveryAndPaymentSummary() {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const deliveryAddress = useCheckoutStore((s) => s?.deliveryAddress);
  const selectedPaymentMethod = useCheckoutStore(
    (s) => s?.selectedPaymentMethod
  );

  return (
    <RNView className="px-5 py-5" style={{ position: "relative" }}>
      <View className="flex-row items-center mb-1">
        <Ionicons
          name="navigate-outline"
          size={18}
          color={colors.textSecondary}
        />
        <ThemedText className="font-semibold text-base ml-2">
          {t("checkout.delivery_address")}
        </ThemedText>
      </View>
      <TouchableOpacity
        onPress={() => router.push("/checkout/address")}
        accessibilityRole="button"
        activeOpacity={0.7}
        className="self-start mb-2"
      >
        <View className="flex-row items-center px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10">
          <Ionicons name="create-outline" size={14} color={colors.tint} />
          <ThemedText
            className="ml-1.5 text-[12px] font-medium"
            style={{ color: colors.tint }}
          >
            {t("common.change")}
          </ThemedText>
        </View>
      </TouchableOpacity>

      {deliveryAddress ? (
        <View className="mb-4">
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
      ) : (
        <ThemedText className="opacity-60 mb-4">
          {t("checkout.add_new_address")}
        </ThemedText>
      )}

      <View
        className="my-2"
        style={{ borderTopWidth: 1, borderTopColor: colors.border }}
      />

      <View className="flex-row items-center mb-1">
        <Ionicons name="card-outline" size={18} color={colors.textSecondary} />
        <ThemedText className="font-semibold text-base ml-2">
          {t("checkout.payment_method")}
        </ThemedText>
      </View>

      {selectedPaymentMethod?.id === "bank_transfer" && (
        <TouchableOpacity
          onPress={() => router.push("/checkout/bank-transfer")}
          accessibilityRole="button"
          activeOpacity={0.7}
          className="mb-2 self-start"
        >
          <View className="flex-row items-center px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10">
            <Ionicons
              name="information-circle-outline"
              size={14}
              color={colors.tint}
            />
            <ThemedText
              className="ml-1.5 text-[12px] font-medium"
              style={{ color: colors.tint }}
            >
              {t("checkout.view_bank_details_prompt")}
            </ThemedText>
          </View>
        </TouchableOpacity>
      )}

      {selectedPaymentMethod ? (
        <View className="flex-row items-center">
          <Ionicons
            name={selectedPaymentMethod?.icon as any}
            size={24}
            color={colors.text}
            style={{ marginRight: 12 }}
          />
          <View>
            <ThemedText className="font-semibold">
              {selectedPaymentMethod?.title || t("common.no_title")}
            </ThemedText>
            {selectedPaymentMethod?.subtitle && (
              <ThemedText className="text-sm opacity-60">
                {selectedPaymentMethod?.subtitle}
              </ThemedText>
            )}
          </View>
        </View>
      ) : (
        <ThemedText className="opacity-60">
          {t("checkout.no_payment_method_selected")}
        </ThemedText>
      )}
      <RNView
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </RNView>
  );
}
