// Mock useAddressActions hook
import { useState } from "react";

export const useAddressActions = () => {
  const [loading, setLoading] = useState(false);

  const deleteAddress = async (addressId: string) => {
    setLoading(true);
    console.log("Mock: Deleting address", addressId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return { success: true };
  };

  const setDefaultAddress = async (addressId: string) => {
    setLoading(true);
    console.log("Mock: Setting default address", addressId);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return { success: true };
  };

  const editAddress = async (addressId: string, data: any) => {
    setLoading(true);
    console.log("Mock: Editing address", addressId, data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    return { success: true };
  };

  return {
    deleteAddress,
    setDefaultAddress,
    editAddress,
    loading,
  };
};