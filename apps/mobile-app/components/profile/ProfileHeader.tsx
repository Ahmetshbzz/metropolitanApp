import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import React from "react";
import { TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useHaptics } from "@/hooks/useHaptics";
import { ProfileBadge } from "./ProfileBadge";

export function ProfileHeader() {
  // Mock user data for UI rendering
  const user = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    profilePicture: null,
    userType: 'individual'
  };
  const colorScheme = useColorScheme();
  const router = useRouter();
  const colors = Colors[colorScheme ?? "light"];
  const { withHapticFeedback } = useHaptics();

  const handlePress = withHapticFeedback(() => {
    router.push("/edit-profile");
  }, "light");

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      style={{
        marginHorizontal: 16,
        marginTop: 10,
        alignSelf: "stretch",
        width: "auto",
      }}
    >
      <View
        style={{
          width: "100%",
          borderRadius: 16,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <ThemedView
          className="flex-row items-center p-4 overflow-hidden rounded-2xl"
          lightColor={Colors.light.card}
          darkColor={Colors.dark.card}
        >
          <Image
            source={
              user?.profilePicture
                ? { uri: user.profilePicture }
                : require("@/assets/images/default-avatar.png")
            }
            style={{ width: 64, height: 64, borderRadius: 32, marginRight: 14 }}
            contentFit="cover"
          />
          <View style={{ flex: 1, backgroundColor: "transparent" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ThemedText className="text-lg font-semibold">
                {user?.firstName} {user?.lastName}
              </ThemedText>
              {user && (
                <ProfileBadge
                  type={user?.userType === "corporate" ? "b2b" : "b2c"}
                />
              )}
            </View>
            <ThemedText
              className="text-sm mt-1"
              style={{ color: colors.mediumGray }}
            >
              {user?.email}
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.darkGray} />
        </ThemedView>
      </View>
    </TouchableOpacity>
  );
}
