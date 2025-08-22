//  "OrderListItem.tsx"
//  metropolitan app
//  Minimalist row-style order item (no card)

import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useTranslation } from "react-i18next";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors, { StatusUtils } from "@/constants/Colors";
import { formatPrice } from "@/core/utils";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DateFormats, formatDate } from "@/utils/date.utils";
import type { Order } from "@metropolitan/shared";

interface OrderListItemProps {
  order: Order;
}

export function OrderListItem({ order }: OrderListItemProps) {
  const { t, i18n } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const statusColors = StatusUtils.getStatusColor(order.status, colors);

  return (
    <Link href={`/order/${order.id}`} asChild>
      <Pressable className="active:opacity-80">
        <View className="px-5 py-5 flex-row items-center relative overflow-hidden">
          {/* Left status strip */}
          <View
            className="absolute left-0 top-0 bottom-0"
            style={{
              width: 3,
              backgroundColor: statusColors.text,
              opacity: 0.95,
            }}
          />

          {/* Content */}
          <View className="flex-1 mr-5">
            <ThemedText className="text-[16px] font-semibold" numberOfLines={1}>
              {t("orders.order_no", { id: order.orderNumber })}
            </ThemedText>

            <View className="mt-2 flex-row items-center justify-between">
              <ThemedText className="text-[13px] opacity-70">
                {formatDate(
                  order.createdAt,
                  DateFormats.FULL_DATE,
                  i18n.language
                )}
              </ThemedText>
              <ThemedText
                className="text-[16px] font-extrabold"
                style={{ color: colors.tint }}
              >
                {formatPrice(order.totalAmount, order.currency)}
              </ThemedText>
            </View>

            <View className="mt-2">
              <View
                className="self-start px-2 py-0.5 rounded-lg"
                style={{ backgroundColor: statusColors.bg }}
              >
                <ThemedText
                  className="text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: statusColors.text }}
                >
                  {StatusUtils.getStatusText(order.status, t)}
                </ThemedText>
              </View>
            </View>
          </View>

          {/* Chevron */}
          <Ionicons name="chevron-forward" size={22} color={colors.icon} />

          {/* Bottom divider */}
          <View
            className="absolute left-0 right-0 bottom-0"
            style={{ height: 1, backgroundColor: colors.borderColor }}
          />
        </View>
      </Pressable>
    </Link>
  );
}
