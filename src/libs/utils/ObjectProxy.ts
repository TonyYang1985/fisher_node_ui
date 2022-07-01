/* eslint-disable no-unused-vars */
export function proxy<T>(target: T, handler: (type: 'set' | 'get', property: string | symbol, value: any) => void) {
  const proxy = new Proxy(target as any, {
    get: (_, property) => {
      const value = target[property];
      handler('get', property, value);
      return value;
    },
    set: (_, property, value) => {
      target[property] = value;
      handler('set', property, value);
      return true;
    },
  });
  return proxy as T;
}
