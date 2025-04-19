 // components/ui-web/web-checkbox.tsx
import React from "react";

interface WebCheckboxProps {
  checked: boolean;
  onCheckedChange: (newValue: boolean) => void;
  className?: string;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  className,
  accessibilityLabel,
}: WebCheckboxProps) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      className={className}
      aria-label={accessibilityLabel}
      style={{
        width: 20,
        height: 20,
        cursor: "pointer",
      }}
    />
  );
}
