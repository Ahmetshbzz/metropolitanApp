//  "payment.tsx"
//  metropolitan app
//  Created by Ahmet on 07.07.2025.

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, View , View as RNView } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BaseButton } from "@/components/base/BaseButton";
import { ProgressIndicator } from "@/components/checkout/ProgressIndicator";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useState } from "react";
import type { CheckoutPaymentMethod } from "@metropolitan/shared";

export default function CheckoutPaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const { withHapticFeedback } = useHaptics();

  // Mock user
  const user = { userType: "individual" };

  // Mock payment methods
  const [paymentMethods] = useState([
    {
      id: "credit_card",
      title: "Credit Card",
      subtitle: "Visa, Mastercard, American Express",
      icon: "card-outline"
    },
    {
      id: "bank_transfer", 
      title: "Bank Transfer",
      subtitle: "Transfer directly from your bank",
      icon: "business-outline"
    }
  ]);

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [currentStep, setCurrentStep] = useState(2);

  const setPaymentMethod = (method: CheckoutPaymentMethod) => {
    setSelectedPaymentMethod(method);
    console.log("Mock: Payment method selected", method);
  };

  const setPaymentMethods = (methods: CheckoutPaymentMethod[]) => {
    console.log("Mock: Setting payment methods", methods);
  };

  const nextStep = () => {
    console.log("Mock: Next step");
    setCurrentStep(3);
  };

  const canProceedToNext = () => {
    return selectedPaymentMethod !== null;
  };

  const availablePaymentMethods = paymentMethods;

  useFocusEffect(
    useCallback(() => {
      setCurrentStep(2);
    }, [setCurrentStep])
  );

  const handleSelectPaymentMethod = (method: CheckoutPaymentMethod) => {
    setPaymentMethod?.(method);
    if (method.id === "bank_transfer") {
      router.push("/checkout/bank-transfer");
    }
  };

  const renderPaymentMethodCard = (
    method: CheckoutPaymentMethod,
    isSelected: boolean,
    onSelect: () => void
  ) => (
    <Pressable
      key={method.id}
      onPress={withHapticFeedback(() => onSelect())}
      android_ripple={{ color: "transparent" }}
      style={{ marginBottom: 0 }}
    >
      <RNView
        className="px-5 py-4"
        style={{ position: "relative", backgroundColor: colors.background }}
      >
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View
              className="w-12 h-12 rounded-xl items-center justify-center mr-4"
              style={{ backgroundColor: colors.background }}
            >
              <Ionicons
                name={method.icon as any}
                size={22}
                color={colors.textSecondary}
              />
            </View>
            <View className="flex-1">
              <ThemedText className="font-medium text-base">
                {method.title}
              </ThemedText>
              {method.subtitle && (
                <ThemedText className="text-sm opacity-70 mt-0.5">
                  {method.subtitle}
                </ThemedText>
              )}
            </View>
          </View>
          <View className="ml-3">
            <Ionicons
              name={isSelected ? "checkmark-circle" : "ellipse-outline"}
              size={22}
              color={isSelected ? colors.tint : colors.mediumGray}
            />
          </View>
        </View>
        <View
          className="absolute left-0 right-0 bottom-0"
          style={{ height: 1, backgroundColor: colors.borderColor }}
        />
      </RNView>
    </Pressable>
  );

  const handleNext = () => {
    if (canProceedToNext()) {
      nextStep();
      router.push("/checkout/summary");
    }
  };

  return (
    <ThemedView className="flex-1">
      <ProgressIndicator />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5 gap-6">
          {/* Ödeme Yöntemleri */}
          <View>
            <ThemedText className="text-lg font-semibold mb-4">
              {t("checkout.payment_screen_title")}
            </ThemedText>

            <View>
              {availablePaymentMethods.map((method) =>
                renderPaymentMethodCard(
                  method,
                  selectedPaymentMethod?.id === method.id,
                  () => handleSelectPaymentMethod(method)
                )
              )}
            </View>
          </View>

          {/* Güvenlik Bilgisi taşındı: footer'ın üstünde gösterilecek */}

          {/* Note removed per design: future payment methods text */}
        </View>
      </KeyboardAwareScrollView>

      <KeyboardStickyView>
        <View
          className="p-5"
          style={{
            paddingBottom: insets.bottom + 20,
            backgroundColor: colors.background,
          }}
        >
          {/* Güvenlik Bilgisi - minimalist (buton üstü) */}
          <View className="flex-row items-center mb-3">
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={colors.textSecondary}
            />
            <ThemedText className="ml-2 text-xs opacity-70">
              {t("checkout.secure_payment_desc")}
            </ThemedText>
          </View>
          <BaseButton
            variant="primary"
            size="small"
            title={t("checkout.continue_to_summary")}
            onPress={handleNext}
            disabled={!canProceedToNext()}
            fullWidth
          />
        </View>
      </KeyboardStickyView>
    </ThemedView>
  );
}
