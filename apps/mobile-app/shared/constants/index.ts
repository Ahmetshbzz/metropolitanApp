// Ortak sabitler (mobile-app local)

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: "/auth",
  AUTH_SEND_OTP: "/auth/send-otp",
  AUTH_VERIFY_OTP: "/auth/verify-otp",
  USERS: "/users",
  USER_ME: "/users/me",
  USER_ME_PROFILE: "/users/me/profile",
  USER_ME_ADDRESSES: "/users/me/addresses",
  PRODUCTS: "/products",
  ORDERS: "/orders",
  ME_CART: "/me/cart",
  CART: "/cart",
  GUEST_CART: "/guest/cart",
  FAVORITES: "/favorites",
  GUEST_FAVORITES: "/guest/favorites",
  ADDRESSES: "/addresses",
  PAYMENTS: "/payments",
} as const;

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: "credit_card",
  BANK_TRANSFER: "bank_transfer",
  CASH_ON_DELIVERY: "cash_on_delivery",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Bağlantı hatası oluştu",
  VALIDATION_ERROR: "Geçersiz veri",
  UNAUTHORIZED: "Yetkisiz erişim",
  NOT_FOUND: "Bulunamadı",
  SERVER_ERROR: "Sunucu hatası",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVED: "Başarıyla kaydedildi",
  UPDATED: "Başarıyla güncellendi",
  DELETED: "Başarıyla silindi",
  SENT: "Başarıyla gönderildi",
} as const;
