import getConfig from 'next/config';
import { useEffect, useState } from 'react';

const {
  publicRuntimeConfig: { localePath, localeExtension },
} = getConfig();

export const hashCode = (s = '') => {
  return s.split('').reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};

export const selectOne = <T>(input: any, arr: T[]): T => {
  const num = Math.abs(hashCode(`${JSON.stringify(input)}`)) % arr.length;
  return arr[num];
};

export const resolveValue = <T>(obj: T, ...args: unknown[]) => {
  return Promise.resolve(getValue(obj, ...args));
};

export const getValue = <T>(obj: T, ...args: unknown[]) => {
  if (typeof obj === 'function') {
    return obj(args) as T;
  } else {
    return obj;
  }
};

const localesCache: Record<string, string[]> = {};

export const loadLocales = async (locale: string) => {
  if (typeof window === 'undefined') {
    if (localesCache[locale]) {
      return localesCache[locale];
    }
    const glob = require('glob-promise');
    const path = require('path');
    const res = await glob(`${localePath}/${locale}/*.${localeExtension}`).then((paths) => paths.map((p) => path.basename(p, `.${localeExtension}`)));
    localesCache[locale] = res;
    return res;
  }
};

export // Hook
function useWindowSize() {
  // Initialize state with undefined width/height so server and client renders match
  // Learn more here: https://joshwcomeau.com/react/the-perils-of-rehydration/
  const [windowSize, setWindowSize] = useState<{ width?: number; height?: number }>({});

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount

  return windowSize;
}
