//  "OrderInfoSection.tsx"
//  metropolitan app
//  Created by Ahmet on 12.07.2025. Düzenlenme tarihi: 21.07.2025.

import { useTranslation } from "react-i18next";
import { View } from "react-native";

import Colors, { StatusUtils } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DateFormats, formatDate } from "@/utils/date.utils";
import type { OrderDetail } from "@metropolitan/shared";
import { ThemedText } from "../ThemedText";

interface OrderInfoSectionProps {
  order: OrderDetail;
}

export function OrderInfoSection({ order }: OrderInfoSectionProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const statusColors = StatusUtils.getStatusColor(order.status, colors);

  return (
    <View className="relative px-5 py-5">
      {/* Left status strip */}
      <View
        className="absolute left-0 top-0 bottom-0"
        style={{
          width: 3,
          backgroundColor: statusColors.text,
          opacity: 0.95,
        }}
      />

      <View className="pl-3">
        <ThemedText className="text-[16px] font-semibold" numberOfLines={1}>
          {t("orders.order_no", { id: order.orderNumber })}
        </ThemedText>

        <View className="mt-2">
          <ThemedText className="text-[13px] opacity-70">
            {formatDate(
              order.createdAt,
              DateFormats.FULL_WITH_TIME,
              i18n.language
            )}
          </ThemedText>
        </View>

        {/* Status badge removed here to avoid duplication; still shown in tracking section */}
      </View>
      {/* Divider */}
      <View
        className="absolute left-0 right-0 bottom-0"
        style={{ height: 1, backgroundColor: colors.borderColor }}
      />
    </View>
  );
}
