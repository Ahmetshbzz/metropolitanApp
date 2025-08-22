//  "OrderDetailContainer.tsx"
//  metropolitan app
//  Created by Ahmet on 27.07.2025.

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedView } from "@/components/ThemedView";
import { ErrorState } from "@/components/ui/ErrorState";
import { OrderDetailSkeleton } from "@/components/ui/ShimmerView";
import Colors from "@/constants/Colors";
// import { useOrderStore } from "@/stores/order/orderStore";
import { ActionsSection } from "./ActionsSection";

// Mock order data - static
const mockOrderData = {
  selectedOrder: {
    order: {
      id: 'mock-order-1',
      status: 'confirmed',
      total: 150.00,
      totalAmount: 150.00,
      currency: 'TRY',
      currency_code: 'TRY',
      createdAt: '2024-01-15T10:30:00.000Z',
      trackingNumber: 'TRK123456789',
      orderNumber: 'ORD-12345',
      display_id: 'ORD-12345'
    },
    items: [
      {
        id: 'item-1',
        product: { 
          id: 'prod-1', 
          name: 'Mock Product',
          title: 'Mock Product',
          price: 50.00
        },
        quantity: 2,
        price: 50.00,
        unitPrice: 50.00,
        unit_price: 50.00,
        total: 100.00
      },
      {
        id: 'item-2',
        product: { 
          id: 'prod-2', 
          name: 'Another Mock Product',
          title: 'Another Mock Product',
          price: 25.00
        },
        quantity: 2,
        price: 25.00,
        unitPrice: 25.00,
        unit_price: 25.00,
        total: 50.00
      }
    ]
  },
  loadingDetail: false,
  error: null
};
import { CombinedSummarySection } from "./CombinedSummarySection";
import { DeliveryAndPaymentSection } from "./DeliveryAndPaymentSection";
import { HelpModal } from "./modal/HelpModal";
import { OrderInfoSection } from "./OrderInfoSection";
import { TrackingSection } from "./TrackingSection";

interface OrderDetailContainerProps {
  orderId: string;
  onDownloadInvoice?: () => void;
  onCancelOrder?: () => Promise<void>;
}

export function OrderDetailContainer({
  orderId,
  onDownloadInvoice,
  onCancelOrder,
}: OrderDetailContainerProps) {
  const { t } = useTranslation();
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const safeAreaInsets = useSafeAreaInsets();

  // Use static mock data
  const selectedOrder = mockOrderData.selectedOrder;
  const loadingDetail = mockOrderData.loadingDetail;
  const error = mockOrderData.error;

  const helpModalRef = useRef<BottomSheetModal>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [contentReady, setContentReady] = useState(true);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    // Mock refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handlePressHelp = useCallback(() => {
    helpModalRef.current?.present();
  }, []);

  // Show skeleton while loading or content not ready
  if ((loadingDetail && !selectedOrder) || !contentReady) {
    return (
      <ThemedView className="flex-1">
        <View style={{ flex: 1 }}>
          <OrderDetailSkeleton />
        </View>
      </ThemedView>
    );
  }

  if (error || !selectedOrder) {
    return (
      <ThemedView className="flex-1">
        <ErrorState
          message={t("order_detail.load_error_message")}
          onRetry={() => console.log('Mock retry')}
        />
      </ThemedView>
    );
  }

  const { order } = selectedOrder;

  return (
    <>
      <ThemedView className="flex-1">
        <View style={{ flex: 1 }}>
          <ScrollView
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={colors.tint}
              />
            }
            contentContainerStyle={{
              paddingBottom: Math.max(safeAreaInsets.bottom, 16) + 16,
            }}
          >
            <View className="p-4 gap-4">
              <OrderInfoSection order={order} />
              <TrackingSection order={order} />
              <CombinedSummarySection orderData={selectedOrder} />
              <DeliveryAndPaymentSection order={order} />

              <ActionsSection
                orderData={selectedOrder}
                onPressHelp={handlePressHelp}
                onDownloadInvoice={onDownloadInvoice}
                onCancelOrder={onCancelOrder}
              />
            </View>
          </ScrollView>
        </View>
      </ThemedView>
      <HelpModal ref={helpModalRef} />
    </>
  );
}
