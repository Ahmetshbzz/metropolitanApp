// Mock useTrackingData hook
import { useState, useEffect } from "react";

export const useTrackingData = (orderId: string | undefined) => {
  const [refreshing, setRefreshing] = useState(false);

  // Mock order data
  const selectedOrder = {
    id: orderId || "order-123",
    status: "out_for_delivery", 
    trackingNumber: "TR123456789",
    estimatedDelivery: "2024-01-15T18:00:00Z",
    trackingEvents: [
      {
        id: "1",
        status: "info_received",
        description: "Order information received",
        timestamp: "2024-01-10T10:00:00Z",
        location: "Warehouse"
      },
      {
        id: "2", 
        status: "picked_up",
        description: "Package picked up",
        timestamp: "2024-01-11T14:00:00Z",
        location: "Distribution Center"
      },
      {
        id: "3",
        status: "arrived_at_hub", 
        description: "Arrived at local hub",
        timestamp: "2024-01-12T09:00:00Z",
        location: "Local Hub"
      },
      {
        id: "4",
        status: "out_for_delivery",
        description: "Out for delivery",
        timestamp: "2024-01-15T08:00:00Z",
        location: "Delivery Vehicle"
      }
    ]
  };

  useEffect(() => {
    if (orderId) {
      console.log("Mock: Fetching tracking data for order", orderId);
    }
  }, [orderId]);

  const handleRefresh = async () => {
    if (!orderId) return;

    setRefreshing(true);
    console.log("Mock: Refreshing tracking data for order", orderId);
    
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRefreshing(false);
  };

  return {
    selectedOrder,
    refreshing,
    handleRefresh,
  };
};