//  "settings.ts" – local shared

export interface UserSettings {
  theme: "light" | "dark" | "system";
  mobile?: {
    hapticsEnabled: boolean;
    notificationsEnabled: boolean;
    notificationSoundsEnabled: boolean;
  };
  language?: "tr" | "en" | "pl";
  currency?: "PLN";
  emailNotifications?: {
    orderUpdates: boolean;
    promotions: boolean;
    newsletter: boolean;
  };
}

export const DEFAULT_USER_SETTINGS: UserSettings = {
  theme: "system",
  mobile: {
    hapticsEnabled: true,
    notificationsEnabled: true,
    notificationSoundsEnabled: true,
  },
  language: "tr",
  currency: "PLN",
  emailNotifications: {
    orderUpdates: true,
    promotions: false,
    newsletter: false,
  },
};

export interface UpdateUserSettingsRequest {
  settings: Partial<UserSettings>;
}

export interface UserSettingsResponse {
  success: boolean;
  data: UserSettings;
  message?: string;
}
