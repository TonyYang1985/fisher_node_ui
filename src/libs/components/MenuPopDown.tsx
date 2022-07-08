import _ from 'lodash';
import { useCallback, useLayoutEffect, useState } from 'react';

export const useMenuPopDown = () => {
  const [menuPopDown, setMenuPopDown] = useState<boolean>(true);
  useLayoutEffect(() => {
    const menuPopDown = localStorage.getItem('sg.fot.MenuPopDown') ?? 'false';
    const popDown = menuPopDown.toLowerCase() == 'false' ? false : true;
    setMenuPopDown(popDown);
  }, []);

  const changeMenuPopDown = useCallback((popDown: boolean) => {
    if (_.isBoolean(popDown)) {
      localStorage.setItem('sg.fot.MenuPopDown', `${popDown}`);
      setMenuPopDown(popDown);
    } else {
      localStorage.removeItem('sg.fot.MenuPopDown');
    }
  }, []);

  return { menuPopDown, changeMenuPopDown };
};
