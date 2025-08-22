import { MMKV } from 'react-native-mmkv';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// MMKV storage for persistence
const storage = new MMKV();

const zustandStorage = {
  setItem: (name: string, value: string) => {
    return storage.set(name, value);
  },
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name: string) => {
    return storage.delete(name);
  },
};

// App store interface
interface AppStore {
  // App-level state
  isOnboarded: boolean;
  theme: 'light' | 'dark';
  language: 'tr' | 'en';

  // Actions
  setOnboarded: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'tr' | 'en') => void;
}

// Create the store
export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      // Initial state
      isOnboarded: false,
      theme: 'light',
      language: 'tr',

      // Actions
      setOnboarded: (value) => set({ isOnboarded: value }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

