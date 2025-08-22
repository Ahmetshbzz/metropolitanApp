//  "TrackingOrderInfo.tsx"
//  metropolitan app
//  Created by Ahmet on 27.07.2025.

import { ThemedText } from "@/components/ThemedText";
import { DateFormats, formatDate } from "@/utils/date.utils";
import { Ionicons } from "@expo/vector-icons";
import { Order } from "@metropolitan/shared";
import React from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

interface TrackingOrderInfoProps {
  order: Order;
  onCopyTracking: (trackingNumber: string) => void;
  copied: boolean;
  colors: any;
}

export const TrackingOrderInfo: React.FC<TrackingOrderInfoProps> = ({
  order,
  onCopyTracking,
  copied,
  colors,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <View className="px-5 py-5">
      <ThemedText className="text-lg font-semibold mb-1">
        {t("orders.order_no", { id: order.orderNumber })}
      </ThemedText>
      <ThemedText className="text-sm opacity-70 mb-3">
        {formatDate(order.createdAt, DateFormats.FULL_WITH_TIME, i18n.language)}
      </ThemedText>
      {order.trackingNumber && (
        <View className="flex-row items-center gap-2">
          <ThemedText className="text-sm opacity-70">
            {t("order_detail.tracking.tracking_number")}:
          </ThemedText>
          <TouchableOpacity
            onPress={() =>
              order.trackingNumber && onCopyTracking(order.trackingNumber)
            }
            className="flex-row items-center gap-1"
          >
            <ThemedText
              className="text-sm font-semibold"
              style={{
                color: copied ? colors.success : colors.tint,
              }}
            >
              {copied ? t("common.copied") : order.trackingNumber}
            </ThemedText>
            <Ionicons
              name={copied ? "checkmark-outline" : "copy-outline"}
              size={16}
              color={copied ? colors.success : colors.tint}
            />
          </TouchableOpacity>
        </View>
      )}

      {/* Divider */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </View>
  );
};
