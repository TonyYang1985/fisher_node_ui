import Router, { useRouter } from 'next/router';
import { useEffect } from 'react';
import { datetime } from '../utils/datetime';

export const AutoLocale = () => {
  const { locale, asPath, replace } = useRouter();
  datetime.changeLocale(locale ?? 'en');
  useEffect(() => {
    const savedLocale = localStorage.getItem('sg.fot.savedLocale') ?? 'en';
    if (locale !== savedLocale) {
      replace(asPath, asPath, { locale: savedLocale });
    }
  }, [locale, asPath, replace]);
  return null;
};

export const saveLocale = (locale?: string) => {
  if (locale) {
    localStorage.setItem('sg.fot.savedLocale', locale);
  } else {
    localStorage.removeItem('sg.fot.savedLocale');
  }
};

export const changeLocale = (lang = 'en') => {
  saveLocale(lang);
  Router.replace(Router.asPath, Router.asPath, { locale: lang });
};
