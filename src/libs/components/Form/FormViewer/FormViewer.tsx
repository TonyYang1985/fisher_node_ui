/* eslint-disable no-unused-vars */
import { TFunction, useTranslation } from 'next-i18next';
import { Card } from 'primereact/card';
import React, { PropsWithChildren } from 'react';
import { PropsWithTrans } from '../../../i18n';
import { getValue } from '../../../utils/misc';
import { FormGrid } from '../FormGrid';
import { DisplayerSchema, getDisplayerFromSchema } from './DisplayerManager';

export type DisplayerHeaderFooterFn<P> = (valueObject: P) => React.ReactNode;

export type FormViewerProps<P> = {
  title?: React.ReactNode | DisplayerHeaderFooterFn<P>;
  footer?: React.ReactNode | DisplayerHeaderFooterFn<P>;
  vauleObject: P;
  layout?: number[][];
  schema: DisplayerSchema<P>;
  verbose?: boolean;
  labelTransPrefix?: string;
  compact?: boolean;
};

export function FormViewer<V>({
  title,
  footer,
  labelTransPrefix = '',
  schema,
  layout,
  verbose = false,
  vauleObject,
  useTranslation: useT,
  children,
  compact,
}: PropsWithChildren<PropsWithTrans<FormViewerProps<V>>>) {
  const { t: __t } = useTranslation(typeof useT === 'undefined' || typeof useT === 'function' ? [] : useT);
  const trans: TFunction = typeof useT === 'function' ? useT : __t;

  let cardHeader: React.ReactNode = null;
  if (title) {
    if (typeof title === 'string') {
      cardHeader = trans(title);
    } else {
      cardHeader = title;
    }
  }

  const items = getDisplayerFromSchema<V>(schema, vauleObject, trans, labelTransPrefix);
  const widgets = <FormGrid layout={layout} items={items} verbose={verbose} />;
  if (compact) {
    return (
      <>
        <div>{typeof children === 'function' ? children(widgets) : widgets}</div>
        <div className="text-center">{getValue(footer, vauleObject)}</div>
        {verbose ? (
          <>
            <hr />
            <pre>{JSON.stringify(vauleObject, null, 2)}</pre>
          </>
        ) : null}
      </>
    );
  }
  return (
    <Card title={getValue(cardHeader, vauleObject)} footer={getValue(footer, vauleObject)}>
      {typeof children === 'function' ? children(widgets) : widgets}
      {verbose ? <pre>{JSON.stringify(vauleObject, null, 2)}</pre> : null}
    </Card>
  );
}
