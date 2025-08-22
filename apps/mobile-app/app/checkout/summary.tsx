//  "summary.tsx"
//  metropolitan app
//  Created by Ahmet on 08.06.2025.
//  Modified by Ahmet on 15.07.2025.
//  Updated by Ahmet on 22.07.2025. - Keyboard handling improved

import { useFocusEffect, useNavigation, useRouter } from "expo-router";
import React, { useCallback, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ProgressIndicator } from "@/components/checkout/ProgressIndicator";
import { DeliveryAndPaymentSummary } from "@/components/checkout/summary/DeliveryAndPaymentSummary";
import { OrderNotes } from "@/components/checkout/summary/OrderNotes";
import { OrderTotals } from "@/components/checkout/summary/OrderTotals";
import { SummaryFooter } from "@/components/checkout/summary/SummaryFooter";
import { HapticIconButton } from "@/components/HapticButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { useState } from "react";
import { useCheckoutSummary } from "@/hooks/useCheckoutSummary";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useToast } from "@/hooks/useToast";
import { Ionicons } from "@expo/vector-icons";

export default function CheckoutSummaryScreen() {
  const { t } = useTranslation();
  
  // Mock cart summary
  const summary = {
    itemCount: 3,
    subtotal: 89.97,
    tax: 7.20,
    shipping: 9.99,
    total: 107.16,
    items: [
      { id: "1", name: "Product 1", price: 29.99, quantity: 1 },
      { id: "2", name: "Product 2", price: 39.99, quantity: 1 },
      { id: "3", name: "Product 3", price: 19.99, quantity: 1 }
    ]
  };
  
  const [currentStep, setCurrentStep] = useState(3);
  const { showToast } = useToast();
  const { isCreatingOrder, orderLoading, isBankTransfer, handleCreateOrder } =
    useCheckoutSummary();
  const navigation = useNavigation();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  useFocusEffect(
    useCallback(() => {
      setCurrentStep?.(3);
    }, [setCurrentStep])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View className="flex-row items-center">
          <HapticIconButton
            hapticType="light"
            onPress={() => router.push("/(tabs)")}
          >
            <Ionicons name="home-outline" size={22} color={colors.text} />
          </HapticIconButton>
        </View>
      ),
    });
  }, [navigation, router, colors.text]);

  if (!summary) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ThemedText>{t("common.loading")}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1">
      <ProgressIndicator />
      <KeyboardAwareScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        bottomOffset={200} // Footer yüksekliği + input görünürlüğü
        extraKeyboardSpace={0} // Ekstra scroll alanı kaldırıldı
      >
        <View className="p-5 gap-6" style={{ paddingBottom: 0 }}>
          <DeliveryAndPaymentSummary />
          <OrderTotals />
          <OrderNotes />
        </View>
      </KeyboardAwareScrollView>
      <SummaryFooter
        isBankTransfer={isBankTransfer}
        isCreatingOrder={isCreatingOrder}
        orderLoading={orderLoading}
        onPress={async () => {
          try {
            await handleCreateOrder();
            if (isBankTransfer) {
              showToast(t("checkout.bank_transfer_success"), "success");
            } else {
              showToast(t("checkout.payment_success"), "success");
            }
          } catch (error: any) {
            showToast(
              error.message || t("checkout.order_creation_failed"),
              "error"
            );
          }
        }}
      />
    </ThemedView>
  );
}
