//  "currency.ts"
//  Central currency helper – avoids hardcoding across the app.

// import { useUserSettingsStore } from "@/stores/user-settings/userSettingsStore";

// Mock user settings store
const mockUserSettingsStore = {
  getState: () => ({
    defaultCurrency: "PLN"
  })
};

export function getAppCurrency(): string {
  try {
    const state = mockUserSettingsStore.getState();
    return state.defaultCurrency || "PLN";
  } catch {
    return "PLN";
  }
}
