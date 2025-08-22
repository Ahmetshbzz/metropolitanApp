import { useState, useEffect, useCallback } from 'react';

interface UseOTPProps {
  onSuccess?: () => void;
}

interface UseOTPReturn {
  code: string;
  setCode: (text: string) => void;
  clearError: () => void;
  handleVerifyCode: () => void;
  handleResendCode: () => void;
  resendTimer: number;
  loading: boolean;
  error: boolean;
  errorMessage?: string;
}

export const useOTP = ({ onSuccess }: UseOTPProps = {}): UseOTPReturn => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>();
  const [resendTimer, setResendTimer] = useState(0);

  // Timer effect for resend countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [resendTimer]);

  const clearError = useCallback(() => {
    setError(false);
    setErrorMessage(undefined);
  }, []);

  const handleVerifyCode = useCallback(async () => {
    if (!code || code.length !== 4) {
      setError(true);
      setErrorMessage('Lütfen 4 haneli OTP kodunu girin');
      return;
    }

    setLoading(true);
    setError(false);
    setErrorMessage(undefined);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock verification logic
      if (code === '1234') {
        // Success case
        setCode('');
        onSuccess?.();
      } else {
        // Error case
        setError(true);
        setErrorMessage('Geçersiz OTP kodu. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      setError(true);
      setErrorMessage('Doğrulama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [code, onSuccess]);

  const handleResendCode = useCallback(async () => {
    if (resendTimer > 0) {
      return; // Prevent resend if timer is still active
    }

    setLoading(true);
    setError(false);
    setErrorMessage(undefined);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Start 60 second countdown
      setResendTimer(60);
      
      // Clear current code
      setCode('');
      
      console.log('OTP kodu yeniden gönderildi (Mock)');
    } catch (err) {
      setError(true);
      setErrorMessage('Kod gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [resendTimer]);

  return {
    code,
    setCode,
    clearError,
    handleVerifyCode,
    handleResendCode,
    resendTimer,
    loading,
    error,
    errorMessage,
  };
};