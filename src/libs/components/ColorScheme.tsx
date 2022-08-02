import { useCallback, useLayoutEffect, useState } from 'react';

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<string>('dark');

  useLayoutEffect(() => {
    const colorScheme = localStorage.getItem('sg.fot.ColorScheme') ?? 'dark';
    setColorScheme(colorScheme);
  }, []);

  const changeColorScheme = useCallback((color: string) => {
    const scheme = localStorage.getItem('sg.fot.ColorScheme') ?? 'dark';
    if (color) {
      if (color !== scheme) {
        localStorage.setItem('sg.fot.ColorScheme', `${color}`);
        setColorScheme(color);
      }
    } else {
      localStorage.removeItem('sg.fot.ColorScheme');
    }
  }, []);

  return { colorScheme, changeColorScheme };
};
