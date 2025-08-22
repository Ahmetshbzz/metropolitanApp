//  "address.tsx"
//  metropolitan app
//  Created by Ahmet on 25.06.2025.

import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { BaseButton } from "@/components/base/BaseButton";
import { AddressSection } from "@/components/checkout/AddressSection";
import { BillingAddressToggle } from "@/components/checkout/BillingAddressToggle";
import { ProgressIndicator } from "@/components/checkout/ProgressIndicator";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function CheckoutAddressScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  // Mock address data
  const [addresses] = useState([
    {
      id: "addr-1",
      addressTitle: "Home",
      street: "123 Main Street",
      city: "New York", 
      postalCode: "10001",
      country: "US",
      isDefaultDelivery: true,
      isDefaultBilling: false
    },
    {
      id: "addr-2", 
      addressTitle: "Work",
      street: "456 Business Ave",
      city: "New York",
      postalCode: "10002", 
      country: "US",
      isDefaultDelivery: false,
      isDefaultBilling: true
    }
  ]);

  const [addressesLoading] = useState(false);
  const defaultBillingAddress = addresses.find(addr => addr.isDefaultBilling);
  
  // Mock checkout state
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [billingAddress, setBillingAddress] = useState(null);
  const [billingAddressSameAsDelivery, setBillingAddressSameAsDelivery] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const nextStep = () => {
    console.log("Mock: Next step");
    setCurrentStep(2);
  };

  const canProceedToNext = () => {
    return deliveryAddress && (billingAddressSameAsDelivery || billingAddress);
  };
  
  // No need for external effects - store manages itself

  // Auto-select defaults
  useEffect(() => {
    if (addresses.length > 0) {
      // Auto-select delivery address if not set
      if (!deliveryAddress) {
        // First try to find default delivery address
        const defaultDeliveryAddress = addresses.find(addr => addr.isDefaultDelivery);
        // If no default, use the first address
        const addressToSelect = defaultDeliveryAddress || addresses[0];
        
        if (addressToSelect) {
          setDeliveryAddress(addressToSelect);
        }
      }
      
      // For corporate users with a default billing address, auto-select it
      if (defaultBillingAddress && !billingAddress && !billingAddressSameAsDelivery) {
        setBillingAddress(defaultBillingAddress);
        setBillingAddressSameAsDelivery(false);
      }
    }
  }, [addresses, deliveryAddress, billingAddress, defaultBillingAddress, setDeliveryAddress, setBillingAddress, setBillingAddressSameAsDelivery]);

  useFocusEffect(
    useCallback(() => {
      setCurrentStep(1);
    }, [setCurrentStep])
  );

  const handleNext = () => {
    if (canProceedToNext()) {
      nextStep();
      router.push("/checkout/payment");
    }
  };

  if (addressesLoading) {
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
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="p-5 gap-6">
          {/* Delivery Address Section */}
          <AddressSection
            title={t("checkout.delivery_address")}
            addresses={addresses}
            selectedAddressId={deliveryAddress?.id}
            onSelectAddress={setDeliveryAddress}
            showAddButton={true}
          />

          {/* Billing Address Toggle */}
          <BillingAddressToggle
            value={billingAddressSameAsDelivery}
            onValueChange={setBillingAddressSameAsDelivery}
          />

          {/* Billing Address Section (if different) */}
          {!billingAddressSameAsDelivery && (
            <AddressSection
              title={t("checkout.billing_address")}
              addresses={addresses}
              selectedAddressId={billingAddress?.id}
              onSelectAddress={setBillingAddress}
              showAddButton={false}
            />
          )}
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
          <BaseButton
            variant="primary"
            size="small"
            title={t("checkout.continue_to_payment")}
            onPress={handleNext}
            disabled={!canProceedToNext()}
            fullWidth
          />
        </View>
      </KeyboardStickyView>
    </ThemedView>
  );
}
