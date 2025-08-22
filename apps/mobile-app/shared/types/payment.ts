export interface StripePaymentIntentResponse {
  paymentIntentId: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export type PaymentStatus =
  | "pending"
  | "requires_action"
  | "succeeded"
  | "canceled"
  | "processing"
  | "requires_payment_method";

export type PaymentMethodType =
  | "card"
  | "apple_pay"
  | "google_pay"
  | "blik"
  | null;

export interface StripePaymentResult {
  success: boolean;
  paymentIntentId?: string;
  clientSecret?: string;
  requiresAction?: boolean;
  error?: string;
}

export interface PaymentProcessorParams {
  clientSecret: string;
  t: (key: string) => string;
}

export interface PlatformPayParams extends PaymentProcessorParams {
  confirmPlatformPayPayment: () => Promise<{ error?: { message: string } }>;
}

export interface CardPaymentParams extends PaymentProcessorParams {
  paymentMethodType?: string;
  initPaymentSheet: (params: { paymentIntentClientSecret: string }) => Promise<{ error?: { message: string } }>;
  presentPaymentSheet: () => Promise<{ error?: { message: string } }>;
}

export interface SavedPaymentMethod {
  id: string;
  type: string;
  name: string;
  details: string;
  expiry?: string;
  isDefault: boolean;
  userId?: string;
  createdAt?: string | Date;
}

export interface SavedPaymentMethodData {
  type: string;
  name: string;
  details: string;
  expiry?: string;
}


