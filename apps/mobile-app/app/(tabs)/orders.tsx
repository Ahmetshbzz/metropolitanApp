//  "orders.tsx"
//  metropolitan app
//  Created by Ahmet on 27.06.2025.

import { useCallback } from "react";
import { ActivityIndicator, RefreshControl, ScrollView } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { EmptyOrders } from "@/components/orders/EmptyOrders";
import { OrderListItem } from "@/components/orders/OrderListItem";
import { ErrorState } from "@/components/ui/ErrorState";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";
import { useFocusEffect } from "expo-router";

export default function OrdersScreen() {
  const { paddingBottom } = useTabBarHeight();
  // Mock orders data for UI rendering
  const orders = [
    {
      id: '1',
      orderNumber: 'ORD-001',
      display_id: 'ORD-001',
      status: 'completed',
      total: 125.47,
      totalAmount: 125.47,
      currency: 'TRY',
      currency_code: 'TRY',
      createdAt: '2024-01-15T10:30:00.000Z',
      created_at: '2024-01-15T10:30:00.000Z',
      items: [
        { product: { title: 'Sample Product 1' }, quantity: 2 }
      ]
    },
    {
      id: '2',
      orderNumber: 'ORD-002',
      display_id: 'ORD-002',
      status: 'pending',
      total: 89.99,
      totalAmount: 89.99,
      currency: 'TRY',
      currency_code: 'TRY',
      createdAt: '2024-01-12T14:20:00.000Z',
      created_at: '2024-01-12T14:20:00.000Z',
      items: [
        { product: { title: 'Sample Product 2' }, quantity: 1 }
      ]
    }
  ];
  const loading = false;
  const refreshing = false;
  const error = null;
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  useFocusEffect(
    useCallback(() => {
      // Mock effect - no actual API call
    }, [])
  );

  const handleRefresh = useCallback(() => {
    // Mock refresh - no actual operation
    return Promise.resolve();
  }, []);

  if (loading && orders.length === 0) {
    return (
      <ThemedView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error && orders.length === 0) {
    return (
      <ErrorState
        message="Siparişlerinizi yüklerken bir hata oluştu."
        onRetry={() => console.log('Retry orders fetch')}
      />
    );
  }

  return (
    <ThemedView className="flex-1">
      {orders.length === 0 ? (
        <EmptyOrders />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{
            paddingBottom: paddingBottom,
            paddingTop: 10,
          }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.tint}
            />
          }
        >
          {orders.map((order) => (
            <OrderListItem key={order.id} order={order} />
          ))}
        </ScrollView>
      )}
    </ThemedView>
  );
}
