//  "useUserInfoForm.ts"
//  metropolitan app
//  Created by Ahmet on 22.06.2025.
//  Modified by Ahmet on 22.07.2025. - Optimized state management

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { startTransition, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { Keyboard } from "react-native";

// import { useAuthStore } from "@/stores";

// Mock auth store
const useAuthStore = (selector: any) => {
  const mockAuthState = {
    user: {
      id: 'mock-user-1',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+1234567890'
    },
    updateUserInfo: async (data: any) => {
      console.log('Mock: updateUserInfo called with:', data);
      return { success: true };
    },
    loading: false
  };
  
  if (typeof selector === 'function') {
    return selector(mockAuthState);
  }
  return mockAuthState;
};
import type { NipResponse } from "@metropolitan/shared";
import { isValidEmail } from "@/utils/validation";
import { nanoid } from 'nanoid';

interface UseUserInfoFormReturn {
  // values
  firstName: string;
  lastName: string;
  email: string;
  nip: string;
  companyData: NipResponse | null;
  termsAccepted: boolean;
  isFormValid: boolean;
  // status flags
  isNipChecking: boolean;
  isSaving: boolean;
  nipError: string | null;
  nipWarning: string | null;
  canRegister: boolean;
  // setters / handlers
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setEmail: (v: string) => void;
  setNip: (v: string) => void;
  resetNipStatus: () => void;
  handleCheckNip: () => Promise<void>;
  handleSave: () => Promise<void>;
  setTermsAccepted: (v: boolean) => void;
}

export function useUserInfoForm(isB2B: boolean): UseUserInfoFormReturn {
  const { t } = useTranslation();
  const completeProfile = useAuthStore(state => state.completeProfile);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [nip, setNip] = useState("");

  const [companyData, setCompanyData] = useState<NipResponse | null>(null);
  const [isNipChecking, setIsNipChecking] = useState(false);
  const [isNipVerified, setIsNipVerified] = useState(false);
  const [nipError, setNipError] = useState<string | null>(null);
  const [nipWarning, setNipWarning] = useState<string | null>(null);
  const [canRegister, setCanRegister] = useState(false);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- Terms acceptance persistence (temp flag from Terms screen) ---
  useFocusEffect(
    useCallback(() => {
      const checkTermsAcceptance = async () => {
        const accepted = await AsyncStorage.getItem("terms_accepted_temp");
        if (accepted === "true") {
          setTermsAccepted(true);
          await AsyncStorage.removeItem("terms_accepted_temp");
        }
      };
      checkTermsAcceptance();
    }, [])
  );

  const isFormValid = isB2B
    ? firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      isValidEmail(email) &&
      isNipVerified &&
      canRegister &&
      termsAccepted
    : firstName.trim() !== "" &&
      lastName.trim() !== "" &&
      isValidEmail(email) &&
      termsAccepted;

  // helper to reset nip-related status when input changes - optimized with transition
  const resetNipStatus = useCallback(() => {
    startTransition(() => {
      setIsNipVerified(false);
      setCanRegister(false);
      setCompanyData(null);
      setNipError(null);
      setNipWarning(null);
    });
  }, []);

  const handleCheckNip = async () => {
    if (nip.length !== 10) {
      setNipError(t("user_info.nip_error_length"));
      return;
    }

    Keyboard.dismiss();
    setIsNipChecking(true);
    resetNipStatus();

    try {
      // Mock API call for NIP validation
      console.log(`Mock checkNip API call for NIP: ${nip}`);
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock NIP validation response
      const isValidNip = nip.length === 10 && /^\d+$/.test(nip);
      const mockResponse = {
        status: isValidNip ? 200 : 400,
        data: {
          success: isValidNip,
          data: isValidNip ? {
            companyName: `Mock Company for NIP ${nip}`,
            address: `Mock Address ${nip.slice(-3)}`,
            isActive: true
          } : null,
          message: isValidNip ? 'Mock NIP geçerli' : 'Mock NIP geçersiz'
        }
      };
      
      if (mockResponse.status === 400) {
        setNipError(t("user_info.nip_error_generic"));
        return;
      }
      if (mockResponse.data.success) {
        setCompanyData(mockResponse.data.data);
        setIsNipVerified(true);
        setCanRegister(true);
      } else {
        setCompanyData(mockResponse.data.data);
        setIsNipVerified(true);
        setCanRegister(false);
        setNipWarning(t("user_info.nip_inactive_company"));
      }
    } catch (err: any) {
      setNipError(
        err.response?.data?.error || t("user_info.nip_error_generic")
      );
    } finally {
      setIsNipChecking(false);
    }
  };

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsSaving(true);
    const result = await completeProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      userType: isB2B ? "corporate" : "individual",
      ...(isB2B && { nip: nip.trim() }),
      termsAccepted: true,
    });
    console.log('CompleteProfile result:', result);
    setIsSaving(false);
    if (!result.success) {
      console.log('Registration failed:', result.message);
      alert(result.message);
    } else {
      // Başarılı kayıt sonrası - navigation'u useAppNavigation hook'una bırak
      console.log('Registration completed successfully, auth state updated');
      // Router.replace çağrısı yapmıyoruz, useAppNavigation hook'u otomatik yönlendirecek
    }
  };

  return {
    // values
    firstName,
    lastName,
    email,
    nip,
    companyData,
    termsAccepted,
    isFormValid,
    // status flags
    isNipChecking,
    isSaving,
    nipError,
    nipWarning,
    canRegister,
    // setters / handlers
    setFirstName,
    setLastName,
    setEmail,
    setNip,
    resetNipStatus,
    handleCheckNip,
    handleSave,
    setTermsAccepted,
  };
}
