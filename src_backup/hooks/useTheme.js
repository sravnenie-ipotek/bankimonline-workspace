import { useState } from 'react';
import tailwindConfig from '../../tailwind.config.ts';
/*type ThemeConfig = {
  colors?: {
    accent?: {
      primary: string
      secondary: string
      primaryActiveButton: string
      tertiary: string
    }
    base?: {
      primary: string
      primaryDisabledButton: string
      secondary: string
      secondaryDefaultButton: string
      secondaryHoveredButton: string
      secondaryActiveButton: string
      secondaryDisabledButton: string
      inputs: string
      stroke: string
      disabled: string
      icons: string
    }
    textTheme?: {
      primary: string
      secondary: string
      disabled: string
      secondaryIcons: string
      darkPrimary: string
    }
  }
}*/
const useTheme = () => {
    const [theme] = useState(tailwindConfig.theme?.extend);
    // Здесь можно добавить любую дополнительную логику,
    // например, для обновления темы или для реагирования на изменения темы.
    return theme;
};
export default useTheme;
