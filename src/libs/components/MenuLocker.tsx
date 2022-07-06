import _ from 'lodash';
import Router, { useRouter } from 'next/router';
import { useCallback, useLayoutEffect, useState } from 'react';

export const useMenuLocker = () => {
  const [menuLocker, setMenuLocker] = useState<boolean>(true);
  const { locale } = useRouter();
  useLayoutEffect(() => {
    const menuLocker = localStorage.getItem('sg.fot.menuLocker') ?? 'false';
    const locker = menuLocker.toLowerCase() == 'false' ? false : true;
    setMenuLocker(locker);
  }, []);

  const changeMenuLocker = useCallback((locker: boolean) => {
    if (_.isBoolean(locker)) {
      localStorage.setItem('sg.fot.menuLocker', `${locker}`);
      setMenuLocker(locker);
    } else {
      localStorage.removeItem('sg.fot.menuLocker');
    }
    Router.replace(Router.asPath, Router.asPath, { locale: locale });
  }, []);

  return { menuLocker, changeMenuLocker };
};
