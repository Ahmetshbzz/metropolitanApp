//  "ProductDetailsSheet.tsx"
//  metropolitan app

import CustomBottomSheet from "@/components/CustomBottomSheet";
import { ThemedText } from "@/components/ThemedText";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import React, { useImperativeHandle, useRef } from "react";
import { useTranslation } from "react-i18next";

export interface ProductDetailsSheetRef {
  present: () => void;
  dismiss: () => void;
}

export const ProductDetailsSheet = React.forwardRef<ProductDetailsSheetRef>(
  (_props, ref) => {
    const modalRef = useRef<BottomSheetModal>(null);
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      present: () => modalRef.current?.present(),
      dismiss: () => modalRef.current?.dismiss(),
    }));

    return (
      <CustomBottomSheet
        ref={modalRef}
        title={t("product_detail.details_title")}
      >
        <ThemedText className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">
          {/* boş içerik - daha sonra doldurulacak */}
        </ThemedText>
      </CustomBottomSheet>
    );
  }
);

ProductDetailsSheet.displayName = "ProductDetailsSheet";
