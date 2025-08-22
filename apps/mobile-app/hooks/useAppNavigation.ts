//  "useAppNavigation.ts"
//  metropolitan app
//  Created by Ahmet on 27.06.2025.

// import { useAuthStore, authSelectors } from "@/stores";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

// Mock auth store and selectors
const useAuthStore = (selector: any) => {
  const mockAuthState = {
    user: { id: 'mock-user-1', email: 'test@example.com' },
    isGuest: false,
    loading: false
  };
  
  if (typeof selector === 'function') {
    return selector(mockAuthState);
  }
  return mockAuthState;
};

const authSelectors = {
  user: (state: any) => state.user,
  isGuest: (state: any) => state.isGuest,
  loading: (state: any) => state.loading
};

export const useAppNavigation = () => {
  const user = useAuthStore(authSelectors.user);
  const isGuest = useAuthStore(authSelectors.isGuest);
  const loading = useAuthStore(authSelectors.loading);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Auth state yüklenene kadar bekle
    if (loading) {
      return;
    }

    // Expo Router'ın segmentleri yüklemesini bekle
    if (segments.length === 0) {
      return;
    }

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    console.log('Navigation check:', { user: !!user, isGuest, inAuthGroup, inTabsGroup, segments });

    // Kullanıcı giriş yapmışsa ama auth grubundaysa → tabs'a git
    if (user && inAuthGroup) {
      console.log('User logged in, redirecting to tabs');
      router.replace("/(tabs)");
    }
    // Kullanıcı yoksa ama tabs grubundaysa → auth'a git
    else if (!user && !isGuest && inTabsGroup) {
      console.log('No user, redirecting to auth');
      router.replace("/(auth)");
    }
    // Kullanıcı yoksa ve auth grubunda da değilse → auth'a git
    else if (!user && !isGuest && !inAuthGroup) {
      console.log('No user and not in auth, redirecting to auth');
      router.replace("/(auth)");
    }
  }, [user, isGuest, loading, segments, router]);

  return {
    user,
    isGuest,
    loading,
    segments,
  };
};
