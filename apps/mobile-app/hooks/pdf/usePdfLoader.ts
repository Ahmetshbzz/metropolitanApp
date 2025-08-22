//  "usePdfLoader.ts"
//  metropolitan app
//  Created by Ahmet on 27.07.2025.

import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/useToast";
import { nanoid } from 'nanoid';

interface PdfData {
  source: any;
  base64: string;
  orderNumber: string;
}

export const usePdfLoader = (invoiceId: string | undefined) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { showToast } = useToast();
  
  const [pdfData, setPdfData] = useState<PdfData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    if (invoiceId) {
      loadPdfPreview();
    }
  }, [invoiceId]);

  const loadPdfPreview = async () => {
    if (!invoiceId) return;

    console.log(`Mock loadPdfPreview called for invoiceId: ${invoiceId}`);
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // Mock base64 PDF data (this is just a simple mock)
      const mockBase64Data = "JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL0xlbmd0aCA3MAAKL0ZpbHRlciAvRmxhdGVEZWNvZGUKPj4Kc3RyZWFtCnicEzAzsQgI8LA..." + nanoid();
      
      // Mock order number
      const orderNumber = `ORD-${invoiceId.slice(-6)}`;

      setPdfData({
        source: {
          uri: `data:application/pdf;base64,${mockBase64Data}`,
          cache: true,
        },
        base64: mockBase64Data,
        orderNumber,
      });
      
      console.log(`Mock PDF data loaded successfully for invoice: ${invoiceId}`);
    } catch (error: any) {
      console.error("Mock PDF preview error:", error);
      showToast(t("invoice_preview.load_error"), "error");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleLoadComplete = (numberOfPages: number) => {
    console.log(`PDF yüklendi: ${numberOfPages} sayfa`);
    setTotalPages(numberOfPages);
    setLoading(false);
  };

  const handlePageChanged = (page: number) => {
    setCurrentPage(page);
  };

  const handleError = (error: any) => {
    console.error("PDF yükleme hatası:", error);
    setLoading(false);
    showToast(t("invoice_preview.load_error"), "error");
  };

  return {
    pdfData,
    loading,
    currentPage,
    totalPages,
    handleLoadComplete,
    handlePageChanged,
    handleError,
  };
};