import Router, { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useState } from 'react';

export const useMenuMode = () => {
  const [menuMode, setMenuMode] = useState<string>('');
  const { locale } = useRouter();

  useLayoutEffect(() => {
    const menuMode = localStorage.getItem('sg.fot.menuMode') ?? 'sidebar';
    setMenuMode(menuMode);
    console.log(menuMode);
  }, []);

  const changeMenuMode = useCallback((mode: string) => {
    if (mode) {
      localStorage.setItem('sg.fot.menuMode', mode);
      setMenuMode(mode);
    } else {
      localStorage.removeItem('sg.fot.menuMode');
    }
    console.log(menuMode);
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { menuMode, changeMenuMode };
};
