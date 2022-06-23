import { RestClient } from '@fot/restclient';
import Router from 'next/router';
import { ProgressSpinner } from 'primereact/progressspinner';
import React, { useEffect, useState } from 'react';

class SwitchingStore {
  loading = false;

  url = '';
}

export const Switching = () => {
  const [store, setStore] = useState(new SwitchingStore());
  useEffect(() => {
    const onStart = (url = '') => {
      if (!store.loading) {
        setStore({ loading: true, url });
      }
    };
    const onStop = () => {
      setStore({ loading: false, url: '' });
    };
    Router.events.on('routeChangeStart', onStart);
    Router.events.on('routeChangeComplete', onStop);
    Router.events.on('routeChangeError', onStop);
    RestClient.onStart = (req) => {
      onStart(req.url);
      return req;
    };
    RestClient.onStop = (response) => {
      onStop();
      return response;
    };
    return () => {
      Router.events.off('routeChangeStart', onStart);
      Router.events.off('routeChangeComplete', onStop);
      Router.events.off('routeChangeError', onStop);
      RestClient.onStart = undefined;
      RestClient.onStop = undefined;
    };
  }, [store]);
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 30,
        left: 30,
        zIndex: 9999999,
      }}
    >
      {store.loading ? <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" animationDuration=".5s" /> : null}
    </div>
  );
};
