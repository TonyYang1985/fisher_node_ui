/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, { useEffect, useRef } from 'react';
import { globalStorage } from '@gaias/globalstorage';
import { useTranslation } from 'next-i18next';
import { Toast } from 'primereact/toast';

export type NotifierProps = {
  timeout?: number;
};

export type NotifierSeverity = 'info' | 'success' | 'warn' | 'error';

export class NotifierController {
  static notify(severity: NotifierSeverity, message: string, header?: string) {
    globalStorage.events.emit('Notifier.New', severity, message, header);
  }
}

export const Notifier = ({ timeout = 5 }: NotifierProps) => {
  const toast = useRef<Toast>(null);
  const { t } = useTranslation(['common']);

  useEffect(() => {
    const handler = (severity = 'info', message: string, header?: string) => {
      if (toast.current) {
        toast.current.show({ severity, summary: header ?? t(`Notifier.${severity}`), detail: message, life: timeout } as any);
      }
    };
    globalStorage.events.on('Notifier.New', handler);
    return () => {
      globalStorage.events.off('Notifier.New', handler);
    };
  }, [timeout, t]);

  return <Toast ref={toast} baseZIndex={999997} />;
};
