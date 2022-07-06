import Router, { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useState } from 'react';

export const useMenuMode = () => {
  const [menuMode, setMenuMode] = useState<string>('sidebar');
  const { locale } = useRouter();

  useLayoutEffect(() => {
    const menuMode = localStorage.getItem('sg.fot.menuMode') ?? 'sidebar';
    setMenuMode(menuMode);
  }, []);

  const changeMenuMode = useCallback((mode: string) => {
    if (mode) {
      localStorage.setItem('sg.fot.menuMode', mode);
      if (mode === 'static') {
        localStorage.setItem('sg.fot.menuLocker', 'true');
      } else {
        localStorage.setItem('sg.fot.menuLocker', 'false');
      }
      setMenuMode(mode);
    } else {
      localStorage.removeItem('sg.fot.menuMode');
    }
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { menuMode, changeMenuMode };
};
