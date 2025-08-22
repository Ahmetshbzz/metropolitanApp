//  "phone-login.tsx"
//  metropolitan app
//  Created by Ahmet on 12.06.2025.

import { useFocusEffect } from "expo-router";
import React from "react";
import { TextInput, View } from "react-native";
import {
  KeyboardAwareScrollView,
  KeyboardStickyView,
} from "react-native-keyboard-controller";

import { AuthHeader } from "@/components/auth/AuthHeader";
import { PhoneInput } from "@/components/auth/PhoneInput";
import { SendCodeButton } from "@/components/auth/SendCodeButton";
import { ThemedView } from "@/components/ThemedView";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import {
  PHONE_LOGIN_LAYOUT,
  usePhoneLoginStyles,
} from "@/utils/phoneLoginStyles";

const PhoneLoginScreen = () => {
  // Mock state and functions
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+90");
  const [loading, setLoading] = useState(false);
  const [countryCodeSelection, setCountryCodeSelection] = useState(false);
  
  const isButtonDisabled = phoneNumber.length < 10;
  
  const handlePhoneInputChange = (text: string) => {
    setPhoneNumber(text);
    console.log("Phone number changed:", text);
  };
  
  const handleCountryCodeChange = (code: string) => {
    setCountryCode(code);
    console.log("Country code changed:", code);
  };
  
  const handleCountryCodeFocus = () => {
    setCountryCodeSelection(true);
    console.log("Country code focused");
  };
  
  const handleCountryCodeBlur = () => {
    setCountryCodeSelection(false);
    console.log("Country code blurred");
  };
  
  const handleSendCode = async () => {
    setLoading(true);
    console.log("Sending code to:", countryCode + phoneNumber);
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    console.log("Code sent successfully (mock)");
  };
  
  // Mock translation function
  const t = (key: string) => {
    const translations: Record<string, string> = {
      "phone_login.header_title": "Phone Login",
      "phone_login.info_text": "Please enter your phone number",
      "phone_login.send_code_button": "Send Code",
      "phone_login.error_message": "Error sending code"
    };
    return translations[key] || key;
  };

  const { stickyViewStyle } = usePhoneLoginStyles();
  const { showToast } = useToast();
  const phoneInputRef = React.useRef<TextInput>(null);

  useFocusEffect(
    React.useCallback(() => {
      // focus when screen gains focus
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 100);
    }, [])
  );

  return (
    <ThemedView className="flex-1">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="always"
        disableScrollOnKeyboardHide
        // @ts-ignore – prop provided by KeyboardAwareScrollView but missing in types
        enableAutomaticScroll={false}
        scrollEnabled={false}
      >
        <AuthHeader
          title={t("phone_login.header_title")}
          subtitle={t("phone_login.info_text")}
          style={{ paddingVertical: PHONE_LOGIN_LAYOUT.headerPadding }}
        />
        <View className="flex-1 justify-center px-6 pt-4">
          <PhoneInput
            ref={phoneInputRef}
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            countryCodeSelection={countryCodeSelection}
            onPhoneNumberChange={handlePhoneInputChange}
            onCountryCodeChange={handleCountryCodeChange}
            onCountryCodeFocus={handleCountryCodeFocus}
            onCountryCodeBlur={handleCountryCodeBlur}
          />
        </View>
      </KeyboardAwareScrollView>
      <KeyboardStickyView>
        <View className="px-6 py-4" style={stickyViewStyle}>
          <SendCodeButton
            loading={loading}
            disabled={isButtonDisabled}
            onPress={async () => {
              try {
                await handleSendCode();
              } catch (error: any) {
                showToast(
                  error.message || t("phone_login.error_message"),
                  "error"
                );
              }
            }}
            title={t("phone_login.send_code_button")}
          />
        </View>
      </KeyboardStickyView>
    </ThemedView>
  );
};

export default PhoneLoginScreen;
