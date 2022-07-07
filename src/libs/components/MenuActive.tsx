import _ from 'lodash';
import Router, { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useState } from 'react';

export const useMenuActive = () => {
  const { locale } = useRouter();
  const [menuActive, setMenuActive] = useState<number>(0);

  useLayoutEffect(() => {
    const menuActive = localStorage.getItem('sg.fot.menuActive') ?? '0';
    const activeIndex = parseInt(menuActive);
    setMenuActive(activeIndex);
  }, []);

  const changeMenuActive = useCallback((activeIndex: number) => {
    if (_.isNumber(activeIndex)) {
      localStorage.setItem('sg.fot.menuActive', `${activeIndex}`);
      setMenuActive(activeIndex);
    } else {
      localStorage.removeItem('sg.fot.menuActive');
    }
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { menuActive, changeMenuActive };
};
