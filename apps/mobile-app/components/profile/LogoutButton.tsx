//  "LogoutButton.tsx"
//  metropolitan app
//  Created by Ahmet on 04.07.2025.

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Alert } from "react-native";

import { HapticButton } from "@/components/HapticButton";
import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export function LogoutButton() {
  const { t } = useTranslation();
  // Mock logout function
  const logout = () => {
    console.log('Logout pressed');
  };
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handleLogout = () => {
    Alert.alert(
      t("profile.logout_alert_title"),
      t("profile.logout_alert_message"),
      [
        { text: t("profile.logout_alert_cancel"), style: "cancel" },
        {
          text: t("profile.logout_alert_confirm"),
          style: "destructive",
          onPress: () => logout(),
        },
      ]
    );
  };

  return (
    <HapticButton
      className="flex-row items-center justify-center mx-4 mt-4 p-3.5 rounded-xl"
      style={{
        backgroundColor: colors.danger + "10",
        borderWidth: 1,
        borderColor: colors.danger + "33",
      }}
      onPress={handleLogout}
      hapticType="warning"
      accessibilityRole="button"
      accessibilityLabel={t("profile.logout")}
    >
      <Ionicons name="log-out-outline" size={20} color={colors.danger} />
      <ThemedText
        className="font-semibold ml-2"
        style={{ color: colors.danger }}
      >
        {t("profile.logout")}
      </ThemedText>
    </HapticButton>
  );
}
