//  "DeliveryAndPaymentSection.tsx"
//  metropolitan app
//  Created by Ahmet on 08.06.2025.

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useDeliveryAndPayment } from "@/hooks/useDeliveryAndPayment";
import type { OrderDetail } from "@metropolitan/shared";
import React from "react";
import { View } from "react-native";
import { Divider } from "./Divider";
import { InfoRow } from "./InfoRow";

interface DeliveryAndPaymentSectionProps {
  order: OrderDetail;
}

export function DeliveryAndPaymentSection({
  order,
}: DeliveryAndPaymentSectionProps) {
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const {
    isExpanded,
    toggleExpand,
    shippingAddress,
    billingAddress,
    paymentMethodName,
    paymentExpandable,
    t,
  } = useDeliveryAndPayment(order);

  return (
    <View className="px-5 py-5">
      <ThemedText className="text-lg font-semibold mb-4">
        {t("order_detail.delivery_payment.title")}
      </ThemedText>

      <InfoRow
        icon="card-outline"
        label={t("order_detail.delivery_payment.payment_method")}
        value={paymentMethodName}
        colors={colors}
        isExpandable={paymentExpandable}
        isExpanded={isExpanded}
        onPress={toggleExpand}
      />

      {/* Kart detayları kaldırıldı (Stripe dışı) */}

      <Divider colors={colors} />

      <InfoRow
        icon="location-outline"
        label={t("order_detail.delivery_payment.delivery_address")}
        value={shippingAddress}
        colors={colors}
      />

      <Divider colors={colors} />

      <InfoRow
        icon="document-text-outline"
        label={t("order_detail.delivery_payment.billing_address")}
        value={billingAddress}
        colors={colors}
      />
      {/* Divider bottom */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </View>
  );
}
