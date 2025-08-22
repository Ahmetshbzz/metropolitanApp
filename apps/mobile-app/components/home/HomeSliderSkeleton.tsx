//  "HomeSliderSkeleton.tsx"
//  metropolitan app
//  Created by Ahmet on 24.06.2025.

import { BaseCard } from "@/components/base/BaseCard";
import React from "react";
import { Dimensions } from "react-native";
import ShimmerView from "../ui/ShimmerView";

export function HomeSliderSkeleton() {
  const { width } = Dimensions.get("window");
  const SLIDER_HEIGHT = Math.round(width * (9 / 16));
  return (
    <BaseCard padding={0} style={{ height: SLIDER_HEIGHT, marginBottom: 16 }}>
      <ShimmerView
        style={{
          height: SLIDER_HEIGHT,
          borderRadius: 16,
        }}
      />
    </BaseCard>
  );
}
