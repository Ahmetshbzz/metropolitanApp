//  "buttonConfig.ts"
//  metropolitan app
//  Created by Ahmet on 27.07.2025.

export type ButtonSize = "small" | "medium" | "large";

export type ButtonSizeValues = {
  paddingVertical: number;
  paddingHorizontal: number;
  fontSize: number;
  borderRadius: number;
  minHeight: number;
};

// Size configurations
export const buttonSizeConfig: Record<ButtonSize, ButtonSizeValues> = {
  small: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    fontSize: 15,
    borderRadius: 14,
    minHeight: 40,
  },
  medium: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    fontSize: 16,
    borderRadius: 16,
    minHeight: 48,
  },
  large: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    fontSize: 18,
    borderRadius: 20,
    minHeight: 56,
  },
};
