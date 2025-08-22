// Mock useTrackingHelpers hook

export const useTrackingHelpers = (colors?: any) => {
  // Mock colors if not provided
  const mockColors = {
    statusBadge: {
      delivered: { background: "#28a745", text: "#ffffff" },
      shipped: { background: "#ffc107", text: "#000000" },
      confirmed: { background: "#17a2b8", text: "#ffffff" },
      pending: { background: "#6c757d", text: "#ffffff" },
    }
  };

  const actualColors = colors || mockColors;

  const getTrackingIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "info_received":
        return "document-text-outline";
      case "picked_up":
        return "cube-outline";
      case "arrived_at_hub":
        return "business-outline";
      case "out_for_delivery":
        return "car-outline";
      case "delivered":
        return "checkmark-circle-outline";
      default:
        return "ellipse-outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return actualColors.statusBadge.delivered.background;
      case "out_for_delivery":
        return actualColors.statusBadge.shipped.background;
      case "arrived_at_hub":
        return actualColors.statusBadge.confirmed.background;
      default:
        return actualColors.statusBadge.pending.background;
    }
  };

  const getIconColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return actualColors.statusBadge.delivered.text;
      case "out_for_delivery":
        return actualColors.statusBadge.shipped.text;
      case "arrived_at_hub":
        return actualColors.statusBadge.confirmed.text;
      default:
        return actualColors.statusBadge.pending.text;
    }
  };

  return {
    getTrackingIcon,
    getStatusColor,
    getIconColor,
  };
};