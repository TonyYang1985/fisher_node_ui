/* eslint-disable no-unused-vars */
/* eslint-disable jsx-a11y/alt-text */
import { globalStorage } from '@fot/globalstorage';
import { dequal } from 'dequal/lite';
import _ from 'lodash';
import { Message } from 'primereact/message';
import React, { Component, ComponentType, createContext, PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import useSWR from 'swr';
import { Fetcher, SWRConfiguration, SWRResponse } from 'swr/dist/types';
import { restClient } from '../RC';
import { NotifierController } from './Notifier';

const loadingImg =
  'data:image/gif;base64,R0lGODlhEAAQAPYAAP////RDNvRDNvZwZvmxrPmyrfq1sPq3svZ1a/ZvZfmtp/muqPmvqvq4s/q6tfq9uPZ4bvZtY/mqpPmrpfq7t/q+uvrBvfmoovrAu/rDv/rEwPZsYvmnofvGwvvHw/Z6cfmknfmln/vIxfvKxvvLyPvNyvvOy/3t7PvRzv38/P349/zg3vza2PvX1fvW0/vU0fiRif37+v3z8vzk4/zc2fzZ1veAeP35+f329v3y8fzn5vzj4fzd2/iPh/3w7/zp5/zi4PeDe/iOhv319Pzq6fzm5PeFfPeMhP3v7veIgPZzafZ5cPZyaPq0r/d8c/d/dvvQzfvT0PminP3s6/zf3PZqYPiSi/eJgfeLg/Z2bfd9dPeGfveCeQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAAHuYAAgoIChYaDiACFGyAggjCFiQIRFxwhjoIpPQKDAgkSlZeZMTdCnIoKE6AcmCk3KjicAgMLqaAhgjGwQ0eFBAwMtRIcACmwMjI5hQXMvwsSACrJPj5IhQbY2QYn3N0nhQcNDQ4ODxkoKzM6P0REhQgOFA8YGSIoLCs7M0VJsg8V9DqQQNGCxgogM04JgGAhQwcRJVC4YMFjhZFTiiBo8DAi4osaNIJgJCTgAwkTKF7YiJSIpKGRAAIBACH5BAkKAAAALAAAAAAQABAAAAe+gACCggKFhoOIAIUJEhccIVWFiQIDCwoTjiFSLFYCgwJMBAwLExIcUgaCMJ6KTQWiChKaP4IpngJKBwZNBKRSFrUpPYUNDQcHvBISQwApMTc3hRQUDg7GE1EAzyrchRXf4BRTKkPl5YUW6RYaHSU8Okg+OTkyhUsZ7CIkUSw7P1MnkGC51cHDCBJQXrBYMeMHkSmsBHw4aCKKCxZUdhT5cYWVIicmULxogRHIjCQeCQl4MpIFDyOSEqk0lBJAIAAh+QQJCgAAACwAAAAAEAAQAAAHuYAAgoIChYaDiACFTAwLChIRhYkCSk0FjRMSFxwbAoMCCAcGlwuZFyEhnYQODQdNBKWbIVIhngJZDxQNowsSHFJSGjhWhRYYuQ1NC7MNU58CGRnGDw0SDCuTAh3bGhkVI4Mp4imFIiIjIyQkUzg37jcxMYVOJSZQUS07Jzk4OCoqPWxBQfGiBY8dRJDkkDEEhydFTwqyoLJDxxSFMo48VGSjBo0VFYmc8KExWxCQOohckZSIkCGWgwIBACH5BAkKAAAALAAAAAAQABAAAAe2gACCggKFhoOIAIUIBwYFBAOFiQIQDw4NjgwLCgkCg5QWFRSYBQwKExIRnooaGRiWBgQLqBcXngIfHh2uDgamEhccHBuFJCMiuw8GC8AcISEghSYlJSQiGQYSziDc0QIo4OEniYQCLy8uLSwrJyopkwI2NSw0KzMnMioxKe8wtzQ8VuzQcSIHDhU39q0SEGQFkBk/TviQcfBGj1WKjMwoQkSijCE4hGAsl6QjkhxHJJFTZEjloEAAIfkECQoAAAAsAAAAABAAEAAAB7uAAIKCAoWGg4gAhUsWFRQNSoWJAk4eGo2PBk1MAoMCWiQiHRmOBwYFBAOdilAmJJYVDqcEDAudAk9RrSMdGA1NtQoKCYUuLi9RJiIUBQwKExLRhTXUNS4oLQ1SF9zchTQ0PDxUQD4AUCBSIRwchVQrQEBFRDKCMhlS6oVGOzPzSENupBCkw0CVW0V0/JjiY4iKGIhWCUiy8EQOhwIFWVml6MoJJBdx3IiRAgZHQgKwhLzRQ1IilIZOAggEACH5BAkKAAAALAAAAAAQABAAAAfBgACCggKFhoOIAIVOIh4aFlmFiQJPUCUjHRkYFRQIAoMCNi8oJpgZFQ8ODUqfijUuUaUdFqkNBwafAkE0rygkHRgUt01NTIVUVDQsLiYWDgdNBQUEBIVA1ys8LSMLBQzfCwuFM0XlOidTFxcK7OyFPz9EUz5DAFFSFxISExOFV1MnfMhQAeAGAxAc1EXIhUQgjhspAACREoIDh1YCsOQYogKioAYUF4I6gqNjRABTpGxoBUqAEI8ArEhKRMjQzEGBAAAh+QQJCgAAACwAAAAAEAAQAAAHuIAAgoIChYaDiACFNi8oJiQfhYkCQTQ1jSUjHhoQAoMCRis8LC4oJSIdGRadhDNAKzQtKCSpGBUPngJJRTM7KywoIhkYDxQOCIVERD86MysoGQ8ODg0NB4Un2donBt3eBoVIPj45MioAEgsMBAXtheUyOCopABwSCurrhUdD8jGCIS5ImIBvQC55N+gBAMFBIEFPioTciKEQRIiGEhJAVNRD4cKLFyJsJCQAhiAQIDZISkTS0EgAgQAAIfkECQoAAAAsAAAAABAAEAAAB76AAIKCAoWGg4gAhVsrPCwuT4WJAklFM0A8NS5RJk4CgwJXRD9FO5kvUCUjH5+KJyejM1Q1UaoiHZ8CRz5ISFM/QC4mtxoaEIUyMjk5vEQuHhkWGNOFQzjXOCoAUQcUD98PhSoqNzcxADgTCwYHDQ4OheUxKYIeUgsETewNhT3zglOkcFCXr4mSXPQEHZByYYICBgQKtBIAQ9AKKSEuSFDHgEkrRVZUTMCo0eGAj4QEVAnBgcOFBJISpTSEEkAgACH5BAkKAAAALAAAAAAQABAAAAe8gACCggKFhoOIAIVXP0U7K0GFiQJYJ1ONO1Q0NTYCgwJHOUgnREVAPCwtLk+eikMyolM6QJsvUSieAkIqOEM5JzorLC8oUCZahTc3KrwyRFRRUCUkJCOFMdjYKQAtIt4e4IUp24MuBxUWGRoaHZKDOwRSBAcPFRjphVYASBRSIBMMmjSgUA9CLhFSpHC4ALCAgYEPWgmoAmKhBAULCDQ50ABBK0UbLGLUaEDJR0ICIlxcwICJu0SKDL0UFAgAIfkECQoAAAAsAAAAABAAEAAAB7WAAIKCAoWGg4gAhUc5SCdESYWJAkI4QzI+j0UzRgKDAj03KjiYJz8zQCtBnoopMaI4OSc6Oys8NJ4CMAAprioyJzMrNCw1NpKIKSonKywtLi8vyIknKNbXhSDaICEcEgYZIiQlJSbZId0XEgsGDxkdIiMkhRscHOoKDAYOGO8eH7kuqJuwgMC+B/00sBIQQcKEfAUMNKBQwQIEVooSKFjAIGIDBw8uThIwgEDEAwimjTSEUVAgACH5BAkKAAAALAAAAAAQABAAAAe7gACCggKFhoOIAIU9Nyo4MkeFiQIwACkxjjI+J1cCgwJWgzE3jz5TREmeiiaDl49IRDpFngIbUgpUgikqOVM6MztGhSEhUlINU5Y+RTsrK1SFHNIcxh4yMzTZ2YUX3RISEyAHJlAvLeeF3xMTCgsFDRgjJlFRL4UJ7AsMBQYUFh7yoDyhpW9fkwYUMGgQQaKEKgEDGBBoYqDBAwwZOohwokoRE4oHHFzM+KEjIQFKGojEAEFSopOGTAIIBAAh+QQJCgAAACwAAAAAEAAQAAAHu4AAgoIChYaDiACFVgApMTdChYkCVS6Djyo4RwKDAhtSEzeCjzhDMlicihwhUh2jNzgyOUicAhEXHCAhSAAxKjI+SCdXhRISFxdSDoI4s1NEP4UT08dSQAA5zzrbhQoLCt4SDScz5eaFDOkEBU0EJS40VCsrQIVM600HDhgdUC41NHgEqdXEgL4HFjyUiPKPRSoBSvRRqJDBAwkoDLmkUoSAwgMMGiyaQPFkIyEBECyEHOFEUqKThkwCCAQAOwAAAAAAAAAAAA==';
const spinner = <img src={loadingImg} style={{ position: 'absolute', zIndex: 999999 }} />;

export type ControllerDS<T> = [[...unknown[]] | unknown, Fetcher<T>];

export type RestClientDSPropsWithParam = [
  string,
  {
    pathParam?: unknown;
    urlParam?: unknown;
    header?: unknown;
    bodyData?: unknown;
  },
];

export type RestClientDS = RestClientDSPropsWithParam | string;

export type DataSourceProps<T> = {
  ctlDs?: ControllerDS<T>;
  rcDs?: RestClientDS;
  options?: SWRConfiguration;
  trasnsformer?: (value: any) => T;
  onLoad?: (value?: any) => void;
  name?: string;
  loadingComponent?: boolean;
  render?: (value: T) => React.ReactNode;
};

const DataContext = createContext<any>(null);

function Config<T>(opt: DataSourceProps<T>): SWRConfiguration {
  return {
    revalidateOnFocus: true,
    revalidateOnMount: true,
    errorRetryCount: 3,
    errorRetryInterval: 3000,
    dedupingInterval: 2000,
    refreshInterval: 0,
    refreshWhenHidden: false,
    refreshWhenOffline: false,
    revalidateOnReconnect: true,
    onLoadingSlow: () => {
      NotifierController.notify('warn', 'Connection is slow.');
    },
  };
}
const clearCache = () => sessionStorage.clear();

function selectSWR<T>(opt: DataSourceProps<T>): SWRResponse<T, any> {
  const { name, options, ctlDs, rcDs } = opt;
  if (_.isNil(rcDs) && _.isNil(ctlDs)) {
    return {} as any;
  }
  const _options = options ?? {};
  const mergedOption = Object.assign({}, Config(opt), _options);

  if (ctlDs) {
    let paramStr;
    if (Array.isArray(ctlDs[0])) {
      paramStr = JSON.stringify(ctlDs[0]);
    } else {
      paramStr = JSON.stringify([ctlDs[0]]);
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSWR<T>(
      [name ?? 'ctlDsDefault', paramStr],
      async (_name, _paramStr) => {
        const p = JSON.parse(_paramStr) as any[];
        const result = await Promise.resolve(ctlDs[1](...p));
        return result;
      },
      mergedOption,
    );
  }
  if (rcDs) {
    if (typeof rcDs === 'string') {
      const api = rcDs;
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSWR(
        [api, name ?? api],
        async (_api, _name) => {
          const result = await restClient.call(_api);
          return result;
        },
        mergedOption,
      );
    } else {
      const param = rcDs as RestClientDSPropsWithParam;
      const api = param[0];
      const paramStr = JSON.stringify(param[1]);
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useSWR<T>(
        [api, name ?? api, paramStr],
        async (_api, _name, _paramStr) => {
          const p = JSON.parse(_paramStr);
          const result = await restClient.call(_api, p.pathParam, p.urlParam, p.bodyData, p.header);
          return result;
        },
        mergedOption,
      );
    }
  }
  throw 'Fetcher input parameters wrong!';
}

export function DataSource<T>(props: PropsWithChildren<DataSourceProps<T>>) {
  const [loadedData, setLoadedData] = useState<any>();
  const { data: rawData, mutate, error, isValidating } = selectSWR<T>({ ...props });
  const lastData = useRef<any>();
  useEffect(() => {
    if (_.isNil(props.rcDs) && _.isNil(props.ctlDs)) {
      return;
    }
    if (error) {
      if (!_.isEmpty(error.message) && !`${error.message}`.toLowerCase().trim().startsWith('request aborted')) {
        console.log(error.message);
        NotifierController.notify('error', error.message);
      }
      return;
    }

    if (!_.isNil(rawData)) {
      const data = _.cloneDeep(rawData);
      let transformedData = data;
      if (props.trasnsformer) {
        const transformed = props.trasnsformer(data);
        if (transformed) {
          transformedData = transformed;
        }
      }

      if (!dequal(transformedData, lastData.current)) {
        lastData.current = transformedData;
        setLoadedData(transformedData);
        if (props.onLoad && !_.isNil(transformedData)) {
          props.onLoad(transformedData);
        }
      }
    }

    const handler = () => {
      mutate();
    };
    if (!_.isEmpty(props.name)) {
      globalStorage.events.on('Fetcher.revalidate#' + props.name, handler);
    }
    globalStorage.events.on('Fetcher.revalidateAll', handler);
    return () => {
      if (!_.isEmpty(props.name)) {
        globalStorage.events.off('Fetcher.revalidate#' + props.name, handler);
      }
      globalStorage.events.off('Fetcher.revalidateAll', handler);
    };
  }, [rawData, error, props, mutate]);

  if (_.isNil(props.rcDs) && _.isNil(props.ctlDs)) {
    return <Message severity="error" text={'rcDS or ctlDs must be provided!'} />;
  }

  if (!error && loadedData) {
    return (
      <>
        {_.isNil(rawData) || isValidating ? (props.loadingComponent ? spinner : null) : null}
        <DataContext.Provider value={loadedData}>{props.render ? props.render(loadedData) : props.children}</DataContext.Provider>
      </>
    );
  } else {
    return null;
  }
}

DataSource.clearCache = clearCache;

DataSource.Data = function <T = any>({ children }: { children: (data: T, renderOnDataChanged: (node: () => React.ReactNode) => React.ReactNode) => React.ReactNode }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastData = useRef<T>();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastUi = useRef<any>();
  return (
    <DataContext.Consumer>
      {(data) => {
        const isEq = dequal(lastData.current, data);
        const dt = isEq ? lastData.current : data;
        lastData.current = dt;
        return (children as any)(dt, (node: () => React.ReactNode) => {
          if (!isEq) {
            lastUi.current = node();
          }
          return lastUi.current;
        });
      }}
    </DataContext.Consumer>
  );
};

DataSource.reload = (name?: string) => {
  if (name) {
    globalStorage.events.emit('Fetcher.revalidate#' + name);
  } else {
    globalStorage.events.emit('Fetcher.revalidateAll');
  }
};

export function useData<DATA_TYPE>() {
  return useContext<DATA_TYPE>(DataContext);
}

export type HOCDataSourceProps<DATA_TYPE> = () => DataSourceProps<DATA_TYPE>;

function _withDataSource<COMP_PROPS, DATA_TYPE>(WrappedComponent: ComponentType<COMP_PROPS>, dsProps: DataSourceProps<DATA_TYPE> | HOCDataSourceProps<DATA_TYPE>) {
  return class WithDataSourceClass extends Component<COMP_PROPS> {
    render() {
      const _dsProps = typeof dsProps === 'function' ? dsProps() : dsProps;
      return (
        <DataSource {..._dsProps}>
          <DataSource.Data>{(data: DATA_TYPE) => <WrappedComponent {...this.props} data={data} />}</DataSource.Data>
        </DataSource>
      );
    }
  };
}

export function withDataSource<DATA_TYPE>(dsProps: DataSourceProps<DATA_TYPE> | HOCDataSourceProps<DATA_TYPE>) {
  return function <COMP_PROPS>(WrappedComponent: ComponentType<COMP_PROPS>) {
    return _withDataSource(WrappedComponent, dsProps);
  };
}
