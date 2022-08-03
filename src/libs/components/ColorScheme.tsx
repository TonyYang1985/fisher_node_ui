/* eslint-disable react-hooks/exhaustive-deps */
import Router, { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useState } from 'react';

export const ColorScheme = () => {
  useLayoutEffect(() => {
    const colorScheme = localStorage.getItem('sg.fot.ColorScheme');
    if (colorScheme) {
      localStorage.setItem('sg.fot.ColorScheme', `${colorScheme}`);
    }
  }, []);
  return null;
};

export const useColorScheme = () => {
  const [colorScheme, setColorScheme] = useState<string>('dark');
  const { locale } = useRouter();
  useLayoutEffect(() => {
    const colorScheme = localStorage.getItem('sg.fot.ColorScheme') ?? 'dark';
    setColorScheme(colorScheme);
  }, []);

  const changeColorScheme = useCallback((color: string) => {
    if (color) {
      localStorage.setItem('sg.fot.ColorScheme', `${color}`);
      setColorScheme(color);
    }
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { colorScheme, changeColorScheme };
};
