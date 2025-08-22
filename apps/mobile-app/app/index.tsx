//  "index.tsx"
//  metropolitan app
//  Created by Ahmet on 21.07.2025.

import { Redirect, Stack } from "expo-router";
import React from "react";

import { useState } from "react";
import { SplashScreen } from "@/components/screens/SplashScreen";

export default function Index() {
  // Mock auth state
  const [user] = useState(null);
  const [loading] = useState(false);

  // Auth yükleniyor ise splash screen göster
  if (loading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <SplashScreen />
      </>
    );
  }

  // Kullanıcı giriş yapmışsa ana sayfaya yönlendir
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  // Misafir ya da hiç giriş yapmamışsa auth'a yönlendir
  return <Redirect href="/(auth)" />;
}
