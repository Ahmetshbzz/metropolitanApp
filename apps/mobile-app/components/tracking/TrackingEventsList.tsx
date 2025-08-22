//  "TrackingEventsList.tsx"
//  metropolitan app
//  Created by Ahmet on 27.07.2025.

import { ThemedText } from "@/components/ThemedText";
import { useTrackingHelpers } from "@/hooks/tracking/useTrackingHelpers";
import { Ionicons } from "@expo/vector-icons";
import { TrackingEvent } from "@metropolitan/shared";
import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import { TrackingEventItem } from "./TrackingEventItem";

interface TrackingEventsListProps {
  trackingEvents: TrackingEvent[];
  colors: any;
}

export const TrackingEventsList: React.FC<TrackingEventsListProps> = ({
  trackingEvents,
  colors,
}) => {
  const { t } = useTranslation();
  const { getTrackingIcon, getStatusColor, getIconColor } =
    useTrackingHelpers(colors);

  return (
    <View className="px-5 py-5">
      <ThemedText className="text-lg font-semibold mb-4">
        {t("order_detail.tracking_modal.history.title")}
      </ThemedText>

      {trackingEvents.length > 0 ? (
        <View>
          {trackingEvents.map((event, index) => (
            <TrackingEventItem
              key={event.id}
              event={event}
              index={index}
              isLast={index === trackingEvents.length - 1}
              getTrackingIcon={getTrackingIcon}
              getStatusColor={getStatusColor}
              getIconColor={getIconColor}
              colors={colors}
            />
          ))}
        </View>
      ) : (
        <View className="items-center py-10">
          <Ionicons
            name="information-circle-outline"
            size={48}
            color={colors.mediumGray}
          />
          <ThemedText className="mt-3 opacity-70 text-center">
            {t("order_detail.tracking.no_tracking_info")}
          </ThemedText>
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
