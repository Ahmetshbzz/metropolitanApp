//  "CorporateInfo.tsx"
//  metropolitan app
//  Shows corporate user information and billing address

import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
// import { useAddressStore, addressSelectors, useAuthUser } from "@/stores";
// import type { MobileUser } from "@/stores";

// Mock types and stores
type MobileUser = {
  id: string;
  userType: 'individual' | 'corporate';
  firstName?: string;
  lastName?: string;
  email?: string;
};

const useAuthUser = () => {
  return {
    id: 'mock-user-1',
    userType: 'individual',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@example.com'
  } as MobileUser;
};

const useAddressStore = (selector: any) => {
  const mockAddressState = {
    addresses: [],
    fetchAddresses: () => console.log('Mock: fetchAddresses called'),
    defaultBillingAddress: null
  };
  
  if (typeof selector === 'function') {
    return selector(mockAddressState);
  }
  return mockAddressState;
};

const addressSelectors = {
  addresses: (state: any) => state.addresses,
  defaultBillingAddress: (state: any) => state.defaultBillingAddress
};

export function CorporateInfo() {
  const user = useAuthUser() as MobileUser | null;
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();
  
  const addresses = useAddressStore(addressSelectors.addresses);
  const fetchAddresses = useAddressStore((state) => state.fetchAddresses);
  const billingAddress = useAddressStore(addressSelectors.defaultBillingAddress);

  // Fetch addresses when component mounts for corporate users
  useEffect(() => {
    if (user?.userType === "corporate" && addresses.length === 0) {
      fetchAddresses();
    }
  }, [user?.userType]);

  // Only show for corporate users
  if (!user || user.userType !== "corporate") {
    return null;
  }

  return null;
}