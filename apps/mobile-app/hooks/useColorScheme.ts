//  "useColorScheme.ts"
//  metropolitan app
//  Created by Ahmet on 27.06.2025.

import { useColorScheme as useRNColorScheme } from "react-native";
// NOTE: Barrel import from "@/stores" creates a circular dependency in some screens.
// Import the concrete store directly to prevent re-render loops.

// Override React Native's useColorScheme with mock implementation
export function useColorScheme() {
  // Mock color scheme - always return system color scheme
  const systemColorScheme = useRNColorScheme();
  return systemColorScheme || 'light';
}
