/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/rules-of-hooks */
import { globalStorage } from '@gaias/globalstorage';
import { RestClientError } from '@gaias/restclient';
import _ from 'lodash';
import { i18n, useTranslation } from 'next-i18next';
import { useState } from 'react';
import { NotifierController } from './components/Notifier';
import { CONSTS } from './const';
import { FormError } from './FormError';
import { restClient } from './RC';

export type StoreClassType<T> = new (...args: any[]) => T;

export interface Updater<T> {
  update(value?: Partial<T>): void;
}

export type Updatable<T> = T & Updater<T>;

export class BaseController {
  // t = useTranslation('common').t;

  protected api = (api: string) => restClient.api(api);

  protected useFormError = () => this.makeStore(FormError);

  protected clearFormError(formError: Updatable<FormError>) {
    (formError as any)['__setTargetValue'](new FormError());
  }

  protected handleFormError(error: any, formError: Updatable<FormError>) {
    this.clearFormError(formError);
    const err = error as RestClientError;
    if (err.response?.status === 401) {
      formError.formMessages = ['accessDenied'];
    } else if (err.response?.status === 400) {
      const result = err.response.data;
      formError.formMessages = result.errorMessage;
      formError.fieldMessages = result.data;
    } else if (err.response?.data?.isError) {
      formError.formMessages = err.response?.data.errorMessage;
    } else {
      formError.formMessages = [err.message];
    }
    formError.update();
  }

  protected clearEmptyStr(data: any) {
    return _.omitBy(data, (v) => _.isNil(v) || v === '');
  }

  protected confirm(cb: (isCanceled: boolean) => void, message?: string, header?: string) {
    globalStorage.events.emit(CONSTS.FOT.ConfirmModalOpen + CONSTS.FOT.GlobalConfirm, cb, header, message);
  }

  protected alert(message: string, header?: string, cb = () => {}) {
    globalStorage.events.emit(CONSTS.FOT.AlertModalOpen + CONSTS.FOT.GlobalAlert, cb, header, message);
  }

  protected success(message?: string) {
    const t = i18n?.getFixedT(i18n.language);
    if (t) NotifierController.notify('success', message ?? t('Notifier.success'));
  }

  protected error(message?: string) {
    const t = i18n?.getFixedT(i18n.language);
    if (t) NotifierController.notify('error', message ?? t('Notifier.error'));
  }

  protected warn(message?: string) {
    const t = i18n?.getFixedT(i18n.language);
    if (t) NotifierController.notify('warn', message ?? t('Notifier.warn'));
  }

  protected info(message?: string) {
    const t = i18n?.getFixedT(i18n.language);
    if (t) NotifierController.notify('info', message ?? t('Notifier.info'));
  }

  protected makeObjectStore<T>(myobj?: T | null): Updatable<T> {
    const obj = _.isNil(myobj) ? {} : myobj;
    const [target, setTarget] = useState(obj);
    const proxy = new Proxy(target as any, {
      get: (_, property) => {
        if (property === 'update') {
          return (val: Partial<T>) => {
            setTarget(Object.assign({}, target, val));
          };
        }
        if (property === '__setTargetValue') {
          return setTarget;
        }
        return target[property];
      },
      set: (_, property: string | symbol, value: any) => {
        target[property] = value;
        return true;
      },
    });
    return proxy as Updatable<T>;
  }

  protected makeStore<T>(storeClass: StoreClassType<T>): Updatable<T> {
    const obj = new storeClass();
    return this.makeObjectStore(obj);
  }

  protected getT(...modules: string[]) {
    return useTranslation(modules).t;
  }
}
