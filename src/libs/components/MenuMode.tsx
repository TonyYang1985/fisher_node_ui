import Router, { useRouter } from 'next/router';
import { useCallback, useEffect, useState } from 'react';

export const useMenuMode = () => {
  const [menuMode, setMenuMode] = useState('');
  const { locale } = useRouter();

  useEffect(() => {
    const menuMode = localStorage.getItem('sg.fot.menuMode') ?? 'sidebar';
    setMenuMode(menuMode);
    console.log(menuMode);
  }, [menuMode]);

  const changeMenuMode = useCallback((mode) => {
    if (mode) {
      localStorage.setItem('sg.fot.menuMode', mode);
      setMenuMode(mode);
    } else {
      localStorage.removeItem('sg.fot.menuMode');
    }
    console.log(menuMode);
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return [menuMode, changeMenuMode];
};
