// App constants

export const APP_CONFIG = {
  NAME: 'Metropolitan App',
  VERSION: '1.0.0',
  API_TIMEOUT: 10000,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  APP_SETTINGS: 'app_settings',
} as const;

export const QUERY_KEYS = {
  USER: 'user',
  PRODUCTS: 'products',
  ORDERS: 'orders',
} as const;

