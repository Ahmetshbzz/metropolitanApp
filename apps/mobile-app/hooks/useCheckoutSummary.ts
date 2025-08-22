//  "useCheckoutSummary.ts"
//  metropolitan app
//  Created by Ahmet on 15.07.2025.
import { useRouter } from "expo-router";
import { useState } from "react";
import { useTranslation } from "react-i18next";

// import { useCheckoutStore, useOrderStore, useAuthStore, useCartStore, checkoutSelectors, authSelectors } from "@/stores";
import { useStripePayment } from "@/hooks/useStripePayment";

// Mock store hooks and selectors
const useCheckoutStore = (selector: any) => {
  const mockCheckoutState = {
    deliveryAddress: { id: 'mock-address-1', name: 'Test Address', street: 'Test Street' },
    billingAddress: { id: 'mock-billing-1', name: 'Test Billing' },
    billingAddressSameAsDelivery: true,
    selectedPaymentMethod: { id: 'card', name: 'Credit Card' },
    notes: '',
    resetCheckout: () => console.log('Mock: resetCheckout called'),
  };
  
  if (typeof selector === 'function') {
    return selector(mockCheckoutState);
  }
  return mockCheckoutState;
};

const useOrderStore = (selector: any) => {
  const mockOrderState = {
    createOrder: async (orderData: any) => {
      console.log('Mock: createOrder called with:', orderData);
      return {
        order: {
          id: 'mock-order-' + Date.now(),
          stripeClientSecret: 'pi_mock_client_secret'
        }
      };
    },
    loading: false
  };
  
  if (typeof selector === 'function') {
    return selector(mockOrderState);
  }
  return mockOrderState;
};

const useAuthStore = (selector: any) => {
  const mockAuthState = {
    token: 'mock-jwt-token',
    isGuest: false
  };
  
  if (typeof selector === 'function') {
    return selector(mockAuthState);
  }
  return mockAuthState;
};

const useCartStore = (selector: any) => {
  const mockCartState = {
    clearCart: () => console.log('Mock: clearCart called')
  };
  
  if (typeof selector === 'function') {
    return selector(mockCartState);
  }
  return mockCartState;
};

const checkoutSelectors = {
  deliveryAddress: (state: any) => state.deliveryAddress,
  billingAddress: (state: any) => state.billingAddress,
  billingAddressSameAsDelivery: (state: any) => state.billingAddressSameAsDelivery,
  selectedPaymentMethod: (state: any) => state.selectedPaymentMethod,
  notes: (state: any) => state.notes,
};

export function useCheckoutSummary() {
  const { t } = useTranslation();
  const router = useRouter();
  const clearCart = useCartStore((s) => s.clearCart);
  // Optimized selector usage - prevents unnecessary re-renders
  const createOrder = useOrderStore((s) => s.createOrder);
  const orderLoading = useOrderStore((s) => s.loading);
  const deliveryAddress = useCheckoutStore(checkoutSelectors.deliveryAddress);
  const billingAddress = useCheckoutStore(checkoutSelectors.billingAddress);
  const billingAddressSameAsDelivery = useCheckoutStore(checkoutSelectors.billingAddressSameAsDelivery);
  const selectedPaymentMethod = useCheckoutStore(checkoutSelectors.selectedPaymentMethod);
  const notes = useCheckoutStore(checkoutSelectors.notes);
  const resetCheckout = useCheckoutStore((s) => s.resetCheckout);
  const { processPayment, loading: paymentLoading } = useStripePayment();
  const token = useAuthStore((s) => s.token);
  const isGuest = useAuthStore((s) => s.isGuest);

  const [isProcessing, setIsProcessing] = useState(false);

  // Payment method checks
  const isStripePayment = selectedPaymentMethod
    ? ["card", "apple_pay", "google_pay", "blik"].includes(
        selectedPaymentMethod?.id
      )
    : false;
  const isBankTransfer = selectedPaymentMethod?.id === "bank_transfer";

  const handleCreateOrder = async () => {
    if (!deliveryAddress || !selectedPaymentMethod) {
      throw new Error(t("checkout.missing_fields"));
    }

    // Auth guard: backend "user not found" hatalarını önle
    if (!token || isGuest) {
      throw new Error(t("auth.login_required"));
    }

    setIsProcessing(true);

    try {
      console.log("🎯 Selected payment method:", selectedPaymentMethod);
      console.log("💳 Is Stripe payment:", isStripePayment);
      console.log("🏦 Is Bank transfer:", isBankTransfer);

      // Stripe payment flow (card, Apple Pay, Google Pay, BLIK)
      if (isStripePayment) {
        console.log("🔒 Processing Stripe payment...");

        const orderData = {
          shippingAddressId: deliveryAddress?.id,
          // NOTE: Backend sözleşmesine göre aynıysa göndermemek daha güvenli
          billingAddressId: billingAddressSameAsDelivery
            ? undefined
            : billingAddress?.id,
          paymentMethodId: selectedPaymentMethod.id,
          notes: notes || undefined,
        };

        // Backend'e sipariş oluştur ve Payment Intent al
        const orderResponse = await createOrder(orderData);

        console.log("📦 Order creation response:", orderResponse);

        // Response yapısını kontrol et
        if (!orderResponse || !orderResponse.order) {
          throw new Error(t("order.creation_failed"));
        }

        const { order } = orderResponse;
        const clientSecret = order.stripeClientSecret;

        if (!clientSecret) {
          throw new Error(t("payment.client_secret_missing"));
        }

        console.log(
          "🔑 Processing Stripe payment with clientSecret:",
          clientSecret
        );

        // Stripe ile 3D Secure authentication yap
        console.log(
          "🔧 Processing payment with method:",
          selectedPaymentMethod?.id
        );
        const paymentResult = await processPayment(
          clientSecret,
          selectedPaymentMethod?.id
        );

        if (!paymentResult.success) {
          console.error("❌ Payment failed:", paymentResult.error);
          throw new Error(paymentResult.error || t("checkout.payment_error"));
        }

        // Payment başarılı - webhook otomatik olarak order'ı güncelleyecek
        console.log("✅ Payment successful:", paymentResult);

        await clearCart();
        resetCheckout();
        
        // Direkt sipariş detay sayfasına yönlendir
        router.replace({
          pathname: "/order/[id]",
          params: { id: order.id }
        });
      }
      // Bank transfer flow (existing logic)
      else if (isBankTransfer) {
        console.log("🏦 Processing bank transfer for corporate customer...");

        const orderData = await createOrder({
          shippingAddressId: deliveryAddress?.id,
          billingAddressId: billingAddressSameAsDelivery
            ? undefined
            : billingAddress?.id,
          paymentMethodId: selectedPaymentMethod.id,
          notes: notes || undefined,
        });

        console.log("✅ Bank transfer order creation response:", orderData);
        const orderId = orderData?.order?.id;

        if (orderId) {
          await clearCart();
          resetCheckout();
          
          // Direkt sipariş detay sayfasına yönlendir
          router.replace({
            pathname: "/order/[id]",
            params: { id: orderId },
          });
        } else {
          throw new Error(t("checkout.order_creation_failed"));
        }
      }
    } catch (error: any) {
      // Backend hata mesajını mümkün olduğunca yüzeye çıkar
      console.error("❌ Order creation error:", error);
      if (error?.response) {
        console.error("🧾 Response status:", error.response.status);
        console.error("🧾 Response data:", error.response.data);
      }
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("checkout.order_creation_failed");
      throw new Error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isCreatingOrder: isProcessing,
    orderLoading,
    isBankTransfer,
    isStripePayment,
    handleCreateOrder,
  };
}
