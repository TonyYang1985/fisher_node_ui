import _ from 'lodash';
import Router, { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useState } from 'react';

export const useActiveMenu = () => {
  const { locale } = useRouter();
  const [activeMenu, setActiveMenu] = useState<number>(0);

  /******Active Menu *****/
  useLayoutEffect(() => {
    const menuActive = localStorage.getItem('sg.fot.ActiveMenu') ?? '0';
    const activeMenu = parseInt(menuActive);
    setActiveMenu(activeMenu);
  }, []);

  const changeActiveMenu = useCallback((activeIndex: number) => {
    if (_.isNumber(activeIndex)) {
      localStorage.setItem('sg.fot.ActiveMenu', `${activeIndex}`);
      setActiveMenu(activeIndex);
    } else {
      localStorage.removeItem('sg.fot.ActiveMenu');
    }
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { activeMenu, changeActiveMenu };
};

export const useActiveRootMenu = () => {
  const { locale } = useRouter();
  const [activeRootIndex, setActiveRootIndex] = useState<number>(0);

  useLayoutEffect(() => {
    const activeRoot = localStorage.getItem('sg.fot.ActiveRoot') ?? '0';
    const activeRootIndex = parseInt(activeRoot);
    setActiveRootIndex(activeRootIndex);
  }, []);

  const changeActiveRootMenu = useCallback((activeIndex: number) => {
    if (_.isNumber(activeIndex)) {
      const activeRoot = localStorage.getItem('sg.fot.ActiveRoot') ?? '0';
      const activeRootIndex = parseInt(activeRoot);
      if (activeRootIndex !== activeIndex) {
        localStorage.setItem('sg.fot.ActiveRoot', `${activeIndex}`);
        setActiveRootIndex(activeIndex);
      }
    } else {
      localStorage.removeItem('sg.fot.ActiveRoot');
    }
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { activeRootIndex, changeActiveRootMenu };
};

export const useExtendRootMenu = () => {
  const [extendRootIndex, setExtendRootIndex] = useState<number>(0);

  useLayoutEffect(() => {
    const activeRoot = localStorage.getItem('sg.fot.ExtendRoot') ?? '0';
    const activeRootIndex = parseInt(activeRoot);
    setExtendRootIndex(activeRootIndex);
  }, []);

  const changeExtendRootMenu = useCallback((activeIndex: number) => {
    const extendRoot = localStorage.getItem('sg.fot.ExtendRoot') ?? '0';
    const extendRootIndex = parseInt(extendRoot);
    if (_.isNumber(activeIndex)) {
      if (extendRootIndex === activeIndex) {
        localStorage.setItem('sg.fot.MenuPopDown', 'false');
        const activeRoot = localStorage.getItem('sg.fot.ActiveRoot') ?? '0';
        const activeRootIndex = parseInt(activeRoot);
        localStorage.setItem('sg.fot.ExtendRoot', `${activeRootIndex}`);
        setExtendRootIndex(activeRootIndex);
      } else {
        localStorage.setItem('sg.fot.MenuPopDown', 'true');
        localStorage.setItem('sg.fot.ExtendRoot', `${activeIndex}`);
        setExtendRootIndex(activeIndex);
      }
    } else {
      localStorage.removeItem('sg.fot.ExtendRoot');
    }
  }, []);

  return { extendRootIndex, changeExtendRootMenu };
};
