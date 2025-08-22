//  "profile.tsx"
//  metropolitan app
//  Created by Ahmet on 09.06.2025.

import { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { ReactNode, useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { RefreshControl, ScrollView, View } from "react-native";

import CustomBottomSheet from "@/components/CustomBottomSheet";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { AccountSection } from "@/components/profile/AccountSection";
import { AppSettingsSection } from "@/components/profile/AppSettingsSection";
import { CorporateInfo } from "@/components/profile/CorporateInfo";
import { LogoutButton } from "@/components/profile/LogoutButton";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { SupportSection } from "@/components/profile/SupportSection";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useTabBarHeight } from "@/hooks/useTabBarHeight";

export default function ProfileScreen() {
  const { t } = useTranslation();
  // Mock user settings state
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [currentColorScheme, setCurrentColorScheme] = useState<'light' | 'dark'>('light');
  const { paddingBottom } = useTabBarHeight();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // Mock refresh - simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handlePresentModal = (title: string, content: ReactNode) => {
    setModalTitle(title);
    setModalContent(content);
    bottomSheetRef.current?.present();
  };

  // Create settings object for backward compatibility
  const settings = {
    theme: currentColorScheme,
    hapticsEnabled: hapticFeedback,
    notificationsEnabled: false, // TODO: Implement in store
    notificationSoundsEnabled: false, // TODO: Implement in store
  };

  const toggleHaptics = (value: boolean) => setHapticFeedback(value);

  const toggleTheme = () => {
    const nextTheme = currentColorScheme === 'light' ? 'dark' : 'light';
    setCurrentColorScheme(nextTheme);
  };

  return (
    <ThemedView className="flex-1 bg-transparent">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 32,
          paddingBottom: paddingBottom + 16,
        }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
          />
        }
      >
        <View className="items-center mb-5">
          <ProfileHeader />
        </View>
        <View className="mb-3.5">
          <AccountSection />
        </View>
        <View className="mb-3.5">
          <AppSettingsSection
            settings={settings}
            toggleHaptics={toggleHaptics}
            toggleTheme={toggleTheme}
            handlePresentModal={handlePresentModal}
            dismissModal={() => bottomSheetRef.current?.dismiss()}
          />
        </View>
        <View className="mb-3.5">
          <SupportSection handlePresentModal={handlePresentModal} />
        </View>
        <View className="mb-3.5">
          <LogoutButton />
        </View>
        <View className="items-center mt-2">
          <ThemedText className="text-xs" style={{ color: colors.mediumGray }}>
            {t("profile.version", { version: "1.0.0" })}
          </ThemedText>
        </View>
      </ScrollView>
      <CustomBottomSheet ref={bottomSheetRef} title={modalTitle}>
        {modalContent}
      </CustomBottomSheet>
    </ThemedView>
  );
}
