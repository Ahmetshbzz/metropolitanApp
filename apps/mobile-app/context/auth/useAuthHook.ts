//  "useAuthHook.ts"
//  metropolitan app
//  Created by Ahmet on 09.08.2025.

import { useState } from "react";
import { useTranslation } from "react-i18next";

export const useAuthHook = () => {
  const { t } = useTranslation();
  
  // Mock auth state
  const [user, setUser] = useState(null);
  const [token, setToken] = useState<string | null>(null);
  const [registrationToken, setRegistrationToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(true);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock auth actions
  const sendOTP = async (phone: string) => {
    setLoading(true);
    console.log("Mock: Sending OTP to", phone);
    setPhoneNumber(phone);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return { success: true };
  };

  const verifyOTP = async (otp: string) => {
    setLoading(true);
    console.log("Mock: Verifying OTP", otp);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    if (otp === "1234") {
      setToken("mock-token-existing-user");
      return { success: true, isNewUser: false };
    } else {
      setRegistrationToken("mock-registration-token");
      return { success: true, isNewUser: true };
    }
  };

  const completeProfile = async (profileData: any) => {
    setLoading(true);
    console.log("Mock: Completing profile", profileData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(profileData);
    setToken("mock-token-new-user");
    setRegistrationToken(null);
    setIsGuest(false);
    setLoading(false);
    return { success: true };
  };

  const updateUserProfile = async (profileData: any) => {
    setLoading(true);
    console.log("Mock: Updating user profile", profileData);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser({ ...user, ...profileData });
    setLoading(false);
    return { success: true };
  };

  const uploadProfilePhoto = async (photo: any) => {
    setLoading(true);
    console.log("Mock: Uploading profile photo", photo);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return { success: true, photoUrl: "mock-photo-url" };
  };

  const refreshUserProfile = async () => {
    setLoading(true);
    console.log("Mock: Refreshing user profile");
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return { success: true };
  };

  const loginAsGuest = async () => {
    console.log("Mock: Logging in as guest");
    setIsGuest(true);
    setGuestId("mock-guest-id");
    return { success: true };
  };

  const logout = async () => {
    console.log("Mock: Logging out");
    setUser(null);
    setToken(null);
    setRegistrationToken(null);
    setIsGuest(true);
    setGuestId(null);
    setPhoneNumber(null);
    return { success: true };
  };

  return {
    // State
    user,
    token,
    registrationToken,
    isGuest,
    guestId,
    phoneNumber,
    loading,

    // Actions
    sendOTP,
    verifyOTP,
    completeProfile,
    updateUserProfile,
    uploadProfilePhoto,
    refreshUserProfile,
    loginAsGuest,
    logout,
  };
};
