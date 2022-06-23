import { useRouter } from 'next/router';
import * as yup from 'yup';
import * as yupLocales from './locales';

export const useYup = () => {
  const { locale } = useRouter();
  // eslint-disable-next-line import/namespace
  yup.setLocale(yupLocales[locale ?? 'en'] ?? yupLocales['en']);

  return yup;
};
