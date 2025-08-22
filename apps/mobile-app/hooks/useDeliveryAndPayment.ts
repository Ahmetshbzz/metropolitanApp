// Mock useDeliveryAndPayment hook
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LayoutAnimation } from "react-native";

export const useDeliveryAndPayment = (order?: any) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation();

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  // Helper function to format address object to string
  const formatAddress = (address: any) => {
    if (!address) return "";
    const parts = [
      address.name,
      address.line1,
      address.line2,
      `${address.city}, ${address.state} ${address.postal_code}`,
      address.country
    ].filter(Boolean);
    return parts.join("\n");
  };

  // Mock address objects
  const shippingAddressObj = {
    name: "John Doe",
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US"
  };

  const billingAddressObj = {
    name: "John Doe", 
    line1: "123 Main Street",
    line2: "Apt 4B",
    city: "New York",
    state: "NY",
    postal_code: "10001",
    country: "US"
  };

  // Format addresses as strings for InfoRow
  const shippingAddress = formatAddress(shippingAddressObj);
  const billingAddress = formatAddress(billingAddressObj);

  const paymentMethodName = "Credit Card ****1234";
  const paymentExpandable = false;

  return {
    isExpanded,
    toggleExpand,
    shippingAddress,
    billingAddress,
    paymentMethodName,
    paymentExpandable,
    t,
  };
};
