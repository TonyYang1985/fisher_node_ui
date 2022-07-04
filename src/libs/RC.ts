import { globalStorage } from '@gaias/globalstorage';
import { RestClient } from '@gaias/restclient';
import { HttpBackend, RequestHeader, StateProvider } from '@gaias/restclient/dist/HttpBackend';
import getConfig from 'next/config';

const { publicRuntimeConfig } = getConfig();

export const getKey = (ns: string) => `${ns}.sg.fot.header`;

export const headerProvider = new StateProvider<RequestHeader & { ls?: boolean }>(
  { headers: {} },
  () => {
    const headers = globalStorage.get<Record<string, string>>(getKey(publicRuntimeConfig.appName)) ?? {};
    return {
      headers,
    };
  },
  (header) => {
    globalStorage.set(getKey(publicRuntimeConfig.appName), header.headers, header.ls);
  },
);

export const restClient = new RestClient(new HttpBackend(publicRuntimeConfig.restClientConfig, headerProvider));
