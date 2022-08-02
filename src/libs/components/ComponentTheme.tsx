import { useCallback, useLayoutEffect, useState } from 'react';

export const useComponentTheme = () => {
  const [componentTheme, setComponentTheme] = useState<string>('blue');

  useLayoutEffect(() => {
    const colorScheme = localStorage.getItem('sg.fot.ComponentTheme') ?? 'blue';
    setComponentTheme(colorScheme);
  }, []);

  const changeComponentTheme = useCallback((theme: string) => {
    const scheme = localStorage.getItem('sg.fot.ComponentTheme') ?? 'blue';
    if (theme) {
      if (theme !== scheme) {
        localStorage.setItem('sg.fot.ComponentTheme', `${theme}`);
        setComponentTheme(theme);
      }
    } else {
      localStorage.removeItem('sg.fot.ComponentTheme');
    }
  }, []);

  return { componentTheme, changeComponentTheme };
};
