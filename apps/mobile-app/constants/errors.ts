//  "errors.ts"
//  metropolitan app
//  Created by Ahmet on 09.08.2025.
//  Centralized error messages for consistent user experience

export const ERROR_MESSAGES = {
  // General errors
  NETWORK_ERROR: "İnternet bağlantınızı kontrol edin",
  UNKNOWN_ERROR: "Beklenmeyen bir hata oluştu",
  SERVER_ERROR: "Sunucu hatası oluştu, lütfen daha sonra tekrar deneyin",
  
  // Authentication errors
  AUTH_FAILED: "Kimlik doğrulama başarısız",
  TOKEN_EXPIRED: "Oturum süresi doldu, lütfen tekrar giriş yapın",
  UNAUTHORIZED: "Bu işlem için yetkiniz bulunmamaktadır",
  
  // Cart errors
  CART_ADD_FAILED: "Ürün sepete eklenirken hata oluştu",
  CART_UPDATE_FAILED: "Miktar güncellenirken hata oluştu",
  CART_REMOVE_FAILED: "Ürün silinirken hata oluştu",
  CART_CLEAR_FAILED: "Sepet temizlenirken hata oluştu",
  CART_REFRESH_FAILED: "Sepet yenilenirken hata oluştu",
  CART_EMPTY: "Sepetiniz boş",
  
  // Favorites errors
  FAVORITES_FETCH_FAILED: "Favoriler yüklenirken hata oluştu",
  FAVORITES_ADD_FAILED: "Favori eklenirken hata oluştu",
  FAVORITES_REMOVE_FAILED: "Favori çıkarılırken hata oluştu",
  FAVORITES_CLEAR_FAILED: "Favoriler temizlenirken hata oluştu",
  
  // Payment method errors
  PAYMENT_METHOD_FETCH_FAILED: "Ödeme yöntemleri yüklenirken hata oluştu",
  PAYMENT_METHOD_ADD_FAILED: "Ödeme yöntemi eklenirken hata oluştu",
  PAYMENT_METHOD_UPDATE_FAILED: "Ödeme yöntemi güncellenirken hata oluştu",
  PAYMENT_METHOD_DELETE_FAILED: "Ödeme yöntemi silinirken hata oluştu",
  PAYMENT_METHOD_DEFAULT_UPDATE_NOT_SUPPORTED: "Varsayılan ödeme yöntemleri güncellenemez",
  PAYMENT_METHOD_DEFAULT_DELETE_NOT_SUPPORTED: "Varsayılan ödeme yöntemleri silinemez",
  
  // Product errors
  PRODUCT_FETCH_FAILED: "Ürünler yüklenirken hata oluştu",
  PRODUCT_SEARCH_FAILED: "Ürün araması yapılırken hata oluştu",
  
  // Order errors
  ORDER_FETCH_FAILED: "Siparişler yüklenirken hata oluştu",
  ORDER_CREATE_FAILED: "Sipariş oluşturulurken hata oluştu",
  
  // Address errors
  ADDRESS_FETCH_FAILED: "Adresler yüklenirken hata oluştu",
  ADDRESS_ADD_FAILED: "Adres eklenirken hata oluştu",
  ADDRESS_UPDATE_FAILED: "Adres güncellenirken hata oluştu",
  ADDRESS_DELETE_FAILED: "Adres silinirken hata oluştu",
  
  // Validation errors
  REQUIRED_FIELD: "Bu alan zorunludur",
  INVALID_EMAIL: "Geçersiz email adresi",
  INVALID_PHONE: "Geçersiz telefon numarası",
  INVALID_INPUT: "Geçersiz giriş",
  
  // File upload errors
  FILE_UPLOAD_FAILED: "Dosya yüklenirken hata oluştu",
  FILE_SIZE_TOO_LARGE: "Dosya boyutu çok büyük",
  INVALID_FILE_TYPE: "Geçersiz dosya türü",
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

// Helper function to get error message
export const getErrorMessage = (key: ErrorMessageKey): string => {
  return ERROR_MESSAGES[key];
};

// Helper function to get error message with fallback
export const getErrorMessageWithFallback = (
  key: ErrorMessageKey | string, 
  fallback?: string
): string => {
  if (typeof key === 'string' && key in ERROR_MESSAGES) {
    return ERROR_MESSAGES[key as ErrorMessageKey];
  }
  return fallback || ERROR_MESSAGES.UNKNOWN_ERROR;
};