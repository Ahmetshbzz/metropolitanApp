//  "useProfileForm.ts"
//  metropolitan app
//  Created by Ahmet on 15.07.2025.
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// import { useAuthStore, authSelectors } from "@/stores";
import { isValidEmail } from "@/utils/validation";

// Mock auth store and selectors
const useAuthStore = (selector: any) => {
  const mockAuthState = {
    user: {
      id: 'mock-user-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com'
    },
    updateUserProfile: async (data: any) => {
      console.log('Mock: updateUserProfile called with:', data);
      return { success: true, message: 'Profile updated successfully' };
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

export function useProfileForm() {
  const { t } = useTranslation();
  const user = useAuthStore(authSelectors.user);
  const updateUserProfile = useAuthStore(state => state.updateUserProfile);
  const router = useRouter();

  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [emailBlurred, setEmailBlurred] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;

    if (!isValidEmail(email)) {
      throw new Error(t("edit_profile.email_invalid"));
    }

    const changedData: Partial<typeof user> = {};
    if (firstName !== user.firstName) {
      changedData.firstName = firstName;
    }
    if (lastName !== user.lastName) {
      changedData.lastName = lastName;
    }
    if (email !== user.email) {
      changedData.email = email;
    }

    if (Object.keys(changedData).length === 0) {
      router.back();
      return;
    }

    setLoading(true);
    const { success, message } = await updateUserProfile(changedData);
    setLoading(false);

    if (success) {
      router.back();
      // Success durumunu return edelim, component toast göstersin
      return { success: true, message: t("edit_profile.success_message") };
    } else {
      throw new Error(message);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    emailBlurred,
    setEmailBlurred,
    loading,
    handleSave,
    isSaveDisabled: loading || !isValidEmail(email),
  };
}
