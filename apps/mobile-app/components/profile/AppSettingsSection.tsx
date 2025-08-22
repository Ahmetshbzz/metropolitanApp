//  "AppSettingsSection.tsx"
//  metropolitan app
//  Created by Ahmet on 11.07.2025.

import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { CommunicationPreferencesContent } from "@/components/profile/CommunicationPreferencesContent";
import { ChangeLanguageRow } from "@/components/profile/settings/ChangeLanguageRow";
import { CommunicationPreferencesRow } from "@/components/profile/settings/CommunicationPreferencesRow";
import { HapticsRow } from "@/components/profile/settings/HapticsRow";
import { ThemeRow } from "@/components/profile/settings/ThemeRow";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
// Types now imported from store types
// import type { UserSettings } from "@/stores";
import { useColorScheme } from "@/hooks/useColorScheme";

// Mock UserSettings type
type UserSettings = {
  theme: 'light' | 'dark' | 'system';
  hapticsEnabled: boolean;
  language: string;
  notificationsEnabled: boolean;
};

interface AppSettingsSectionProps {
  settings: UserSettings;
  toggleHaptics: (value: boolean) => void;
  toggleTheme: () => void;
  handlePresentModal: (title: string, content: React.ReactNode) => void;
  dismissModal: () => void;
}

export function AppSettingsSection({
  settings,
  toggleHaptics,
  toggleTheme,
  handlePresentModal,
  dismissModal,
}: AppSettingsSectionProps) {
  const { t } = useTranslation();
  const scheme = (useColorScheme() ?? "light") as keyof typeof Colors;
  const colors = Colors[scheme];

  return (
    <View className="w-full">
      <View style={{ marginHorizontal: 16 }}>
        <ThemedView
          className="rounded-2xl"
          style={{
            backgroundColor: colors.cardBackground,
            borderWidth: 1,
            borderColor: colors.border,
            paddingHorizontal: 12,
            paddingVertical: 0,
          }}
        >
          <ThemeRow
            label={t("profile.app_theme")}
            value={settings.theme}
            onToggle={toggleTheme}
          />
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginLeft: 44,
            }}
          />
          <ChangeLanguageRow label={t("profile.app_language")} />
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginLeft: 44,
            }}
          />
          <HapticsRow
            label={t("profile.haptics")}
            value={settings.hapticsEnabled}
            onToggle={toggleHaptics}
          />
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginLeft: 44,
            }}
          />
          <CommunicationPreferencesRow
            label={t("profile.communication_preferences")}
            onPress={() =>
              handlePresentModal(
                t("profile.communication_preferences"),
                <CommunicationPreferencesContent />
              )
            }
          />
        </ThemedView>
      </View>
    </View>
  );
}
