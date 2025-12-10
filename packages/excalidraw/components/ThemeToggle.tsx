import React, { useEffect, useState } from "react";

import type { ThemeName } from "@excalidraw/common";

const THEMES: ThemeName[] = ["light", "dark", "signet", "cash-app"];

export const ThemeToggle = ({
  theme,
  onChange,
}: {
  theme: ThemeName;
  onChange: (theme: ThemeName) => void;
}) => {
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>(theme);

  useEffect(() => {
    setSelectedTheme(theme);
  }, [theme]);

  return (
    <label className="ThemeToggle">
      <span className="ThemeToggle__label">Theme</span>
      <select
        className="ThemeToggle__select"
        value={selectedTheme}
        onChange={(event) => {
          const nextTheme = event.target.value as ThemeName;
          setSelectedTheme(nextTheme);
          onChange(nextTheme);
        }}
      >
        {THEMES.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
};
