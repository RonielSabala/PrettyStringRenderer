import { useStore } from "../common/store";
import { APP_THEMES } from "../common/types";
import { clearState, saveAppThemeState } from "../utils/persistence";

export function useHeader() {
  const appTheme = useStore((state) => state.appTheme);
  const setAppTheme = useStore((state) => state.setAppTheme);

  // Handlers

  const toggleAppTheme = () => {
    const next =
      appTheme === APP_THEMES.DARK ? APP_THEMES.LIGHT : APP_THEMES.DARK;
    setAppTheme(next);
    saveAppThemeState();
  };

  const handleReset = () => {
    clearState();
    location.reload();
  };

  return { handleReset, toggleAppTheme, appTheme };
}
