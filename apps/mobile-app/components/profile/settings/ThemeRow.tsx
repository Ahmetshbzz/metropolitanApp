import React from "react";
import { SettingsItem } from "@/components/profile/SettingsItem";

interface ThemeRowProps {
  label: string;
  value: "light" | "dark" | "auto";
  onToggle: () => void;
}

export function ThemeRow({ label, value, onToggle }: ThemeRowProps) {
  // Artık cycle mode: light -> dark -> auto -> light...
  const getDisplayValue = () => {
    switch (value) {
      case "light":
        return "Açık";
      case "dark":
        return "Koyu";
      case "auto":
        return "Sistem";
      default:
        return "Sistem";
    }
  };

  return (
    <SettingsItem
      icon="color-palette-outline"
      label={label}
      type="navigation"
      value={getDisplayValue()}
      onPress={onToggle}
    />
  );
}


