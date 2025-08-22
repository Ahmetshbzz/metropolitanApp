import type { Address } from "./address";

export enum PaymentType {
  CARD = "card",
  APPLE_PAY = "apple_pay",
  GOOGLE_PAY = "google_pay",
  BLIK = "blik",
  STRIPE = "stripe",
  BANK_TRANSFER = "bank_transfer",
}

export interface CheckoutPaymentMethod {
  id: string;
  type: PaymentType;
  title: string;
  subtitle?: string;
  icon: string;
  isAvailable: boolean;
}

export interface CheckoutState {
  currentStep: number;
  totalSteps: number;
  deliveryAddress: Address | null;
  billingAddress: Address | null;
  billingAddressSameAsDelivery: boolean;
  selectedPaymentMethod: CheckoutPaymentMethod | null;
  agreedToTerms: boolean;
  paymentMethods: CheckoutPaymentMethod[];
  notes: string;
}

export type Action =
  | { type: "SET_CURRENT_STEP"; payload: number }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SET_DELIVERY_ADDRESS"; payload: Address }
  | { type: "SET_BILLING_ADDRESS"; payload: Address | null }
  | { type: "SET_BILLING_ADDRESS_SAME_AS_DELIVERY"; payload: boolean }
  | { type: "SET_PAYMENT_METHOD"; payload: CheckoutPaymentMethod }
  | { type: "SET_AGREED_TO_TERMS"; payload: boolean }
  | { type: "SET_NOTES"; payload: string }
  | { type: "RESET_CHECKOUT_WITH_STATE"; payload: CheckoutState }
  | { type: "RESET_CHECKOUT" };

export interface CheckoutContextType {
  state: CheckoutState;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canProceedToNext: () => boolean;
  setDeliveryAddress: (address: Address) => void;
  setBillingAddress: (address: Address | null) => void;
  setBillingAddressSameAsDelivery: (same: boolean) => void;
  setPaymentMethod: (method: CheckoutPaymentMethod) => void;
  getAvailablePaymentMethods: () => CheckoutPaymentMethod[];
  setAgreedToTerms: (agreed: boolean) => void;
  resetCheckout: () => void;
  setNotes: (notes: string) => void;
}


