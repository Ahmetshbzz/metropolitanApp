//  "TrackingSection.tsx"
//  metropolitan app
//  Created by Ahmet on 14.06.2025.

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View } from "react-native";

import Colors, { StatusUtils } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import type { OrderDetail } from "@metropolitan/shared";
import { ThemedText } from "../ThemedText";

interface TrackingSectionProps {
  order: OrderDetail;
}

const getTrackingInfo = (order: OrderDetail, t: any) => {
  const status = order.status.toLowerCase();

  switch (status) {
    case "pending":
      return {
        text: t("order_detail.tracking.status_pending"),
        pressable: false,
        isInternal: false,
      };
    case "confirmed":
      return {
        text: t("order_detail.tracking.status_confirmed"),
        pressable: false,
        isInternal: false,
      };
    case "preparing":
      return {
        text: t("order_detail.tracking.status_preparing"),
        pressable: false,
        isInternal: false,
      };
    case "shipped":
      if (order.shippingCompany === "Metropolitan") {
        return {
          text: t("order_detail.tracking.shipped_internal"),
          pressable: true,
          isInternal: true,
        };
      } else {
        return {
          text: t("order_detail.tracking.shipped_external", {
            company: order.shippingCompany,
          }),
          pressable: true,
          isInternal: false,
        };
      }
    case "delivered":
      if (order.shippingCompany === "Metropolitan") {
        return {
          text: t("order_detail.tracking.delivered_internal"),
          pressable: true,
          isInternal: true,
        };
      } else {
        return {
          text: t("order_detail.tracking.delivered_external"),
          pressable: true,
          isInternal: false,
        };
      }
    default:
      return {
        text: null,
        pressable: false,
        isInternal: false,
      };
  }
};

export function TrackingSection({ order }: TrackingSectionProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const { text, pressable, isInternal } = getTrackingInfo(order, t);

  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const statusColors = StatusUtils.getStatusColor(order.status, colors);

  if (!text) {
    return null;
  }

  const handlePress = () => {
    if (pressable || isInternal) {
      router.push(`/tracking/${order.id}`);
    }
  };

  return (
    <View className="px-5 py-5">
      <TouchableOpacity
        className="flex-row items-center justify-between"
        onPress={handlePress}
        disabled={!pressable && !isInternal}
        activeOpacity={0.7}
      >
        <View className="flex-1 pr-3">
          <ThemedText className="text-base font-semibold mb-1.5">
            {t("order_detail.tracking.title")}
          </ThemedText>
          <ThemedText type="defaultSemiBold" className="text-sm">
            {text}
          </ThemedText>
        </View>

        <View className="flex-row items-center gap-3">
          {/* Status Badge (compact) */}
          <View
            className="px-2 py-0.5 rounded-lg"
            style={{ backgroundColor: statusColors.bg }}
          >
            <ThemedText
              className="text-[10px] font-semibold"
              style={{ color: statusColors.text }}
            >
              {StatusUtils.getStatusText(order.status, t)}
            </ThemedText>
          </View>

          {/* Navigation Icon */}
          {isInternal ? (
            <Ionicons name="car-sport-outline" size={24} color={colors.text} />
          ) : pressable ? (
            <Ionicons name="chevron-forward" size={24} color={colors.text} />
          ) : null}
        </View>
      </TouchableOpacity>
      {/* Divider bottom */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </View>
  );
}
