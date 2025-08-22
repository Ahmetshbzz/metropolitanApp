// useToast.tsx
// metropolitan app
// Migrated to Zustand-based global toast management (no React Context needed)

import React from 'react';
import { Toast } from '@/components/common/Toast';

// Hook: Provider bağımlılığı olmadan toast göstermek için
export function useToast() {
  // Mock toast function
  const showToast = (message: string, type?: 'success' | 'error' | 'warning' | 'info') => {
    console.log('Toast:', message, type);
  };
  return { showToast };
}

// Görsel host: toasts listesini dinler ve UI'ı render eder
export function ToastHost() {
  // Mock - no toasts rendered
  return null;
}