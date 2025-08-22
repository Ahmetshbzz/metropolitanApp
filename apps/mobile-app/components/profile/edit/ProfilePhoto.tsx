//  "ProfilePhoto.tsx"
//  metropolitan app
//  Created by Ahmet on 15.07.2025.
import { Image } from "expo-image";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Colors from "@/constants/Colors";
// import { useAuthStore, authSelectors } from "@/stores";
import { useColorScheme } from "@/hooks/useColorScheme";

// Mock auth store and selectors
const useAuthStore = (selector: any) => {
  const mockAuthState = {
    user: {
      id: 'mock-user-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      profilePicture: null
    }
  };
  
  if (typeof selector === 'function') {
    return selector(mockAuthState);
  }
  return mockAuthState;
};

const authSelectors = {
  user: (state: any) => state.user
};

interface ProfilePhotoProps {
  photoLoading: boolean;
  onChoosePhoto: () => void;
  onPreview: () => void;
}

export function ProfilePhoto({
  photoLoading,
  onChoosePhoto,
  onPreview,
}: ProfilePhotoProps) {
  const { t } = useTranslation();
  const user = useAuthStore(authSelectors.user);
  const colorScheme = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];

  return (
    <View className="items-center mb-8">
      <TouchableOpacity onPress={onPreview} activeOpacity={0.85}>
        <Image
          source={
            user?.profilePicture ||
            require("@/assets/images/default-avatar.png")
          }
          style={{ width: 120, height: 120, borderRadius: 60 }}
          contentFit="cover"
          accessibilityLabel="Profil fotoğrafı"
        />
      </TouchableOpacity>
      {photoLoading ? (
        <ActivityIndicator style={{ marginTop: 10 }} />
      ) : (
        <TouchableOpacity className="mt-2.5" onPress={onChoosePhoto}>
          <ThemedText style={{ color: colors.tint }}>
            {t("edit_profile.change_photo")}
          </ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
}
