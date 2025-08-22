//  "AppProviders.tsx"
//  metropolitan app
//  Created by Ahmet on 08.07.2025.
//  MIGRATED TO ZUSTAND - Provider Hell eliminated!

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StripeProvider } from "@stripe/stripe-react-native";

// Only keep essential providers that can't be replaced by Zustand
import { STRIPE_CONFIG } from "@/config/stripe";
import { ToastHost } from "@/hooks/useToast";

interface AppProvidersProps {
  children: React.ReactNode;
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <KeyboardProvider preload={false}>
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <BottomSheetModalProvider>
            <StripeProvider
              publishableKey={STRIPE_CONFIG.publishableKey}
              merchantIdentifier={STRIPE_CONFIG.merchantIdentifier}
              urlScheme={STRIPE_CONFIG.urlScheme}
            >
              <>
                {children}
                <ToastHost />
              </>
            </StripeProvider>
          </BottomSheetModalProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
};
