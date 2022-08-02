import { useCallback, useLayoutEffect, useState } from 'react';

export const useLayoutTheme = () => {
  const [layoutTheme, setLayoutTheme] = useState<string>('blue');

  useLayoutEffect(() => {
    const colorScheme = localStorage.getItem('sg.fot.LayoutTheme') ?? 'blue';
    setLayoutTheme(colorScheme);
  }, []);

  const changeLayoutTheme = useCallback((theme: string) => {
    const scheme = localStorage.getItem('sg.fot.LayoutTheme') ?? 'blue';
    if (theme) {
      if (theme !== scheme) {
        localStorage.setItem('sg.fot.LayoutTheme', `${theme}`);
        setLayoutTheme(theme);
      }
    } else {
      localStorage.removeItem('sg.fot.LayoutTheme');
    }
  }, []);

  return { layoutTheme, changeLayoutTheme };
};
