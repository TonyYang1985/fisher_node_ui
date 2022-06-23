import { TFunction } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { locale } from 'primereact/api';
import './locales';
import { loadLocales } from './utils/misc';

let _lastInstance: any = null;
export const enableI18nHotReload = (i18n) => {
  if (process.env.NODE_ENV === 'development') {
    const timer = setInterval(() => {
      if (i18n && _lastInstance !== i18n) {
        if (typeof window === 'undefined') {
          const { applyServerHMR } = require('i18next-hmr/server');
          applyServerHMR(i18n);
        } else {
          const { applyClientHMR } = require('i18next-hmr/client');
          applyClientHMR(i18n);
        }

        _lastInstance = i18n;
        clearInterval(timer);
      }
    }, 200);
  }
};

export type PropsWithTrans<P> = P & {
  useTranslation?: string | string[] | TFunction;
};

export const i18nPageFn = async (props) => {
  const locale = props['locale'] ?? 'en';
  return {
    props: {
      ...(await serverSideTranslations(locale, await loadLocales(locale))),
    },
  };
};

export const PrimeReactLocale = () => {
  const { locale: _locale } = useRouter();
  if (_locale) {
    locale(_locale);
  }
  return null;
};
