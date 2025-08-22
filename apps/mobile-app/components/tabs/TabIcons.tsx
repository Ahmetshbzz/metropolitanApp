import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View } from "react-native";
import { useTheme } from "@/hooks/useTheme";

function TabIconWrapper({
  children,
  focused,
}: {
  children: React.ReactNode;
  focused: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      {children}
      {focused ? (
        <View
          style={{
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: colors.tint,
            marginTop: 4,
          }}
        />
      ) : null}
    </View>
  );
}

export function HomeIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <TabIconWrapper focused={focused}>
      <Ionicons
        size={24}
        name={focused ? "home" : "home-outline"}
        color={color}
      />
    </TabIconWrapper>
  );
}

export function ProductsIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <TabIconWrapper focused={focused}>
      <Ionicons size={24} name={focused ? "bag" : "bag-outline"} color={color} />
    </TabIconWrapper>
  );
}

export function CartIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <TabIconWrapper focused={focused}>
      <Ionicons
        size={24}
        name={focused ? "cart" : "cart-outline"}
        color={color}
      />
    </TabIconWrapper>
  );
}

export function OrdersIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <TabIconWrapper focused={focused}>
      <Ionicons
        size={24}
        name={focused ? "receipt" : "receipt-outline"}
        color={color}
      />
    </TabIconWrapper>
  );
}

export function ProfileIcon({
  color,
  focused,
}: {
  color: string;
  focused: boolean;
}) {
  return (
    <TabIconWrapper focused={focused}>
      <Ionicons
        size={24}
        name={focused ? "person" : "person-outline"}
        color={color}
      />
    </TabIconWrapper>
  );
}
