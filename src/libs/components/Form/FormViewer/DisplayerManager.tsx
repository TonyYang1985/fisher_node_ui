/* eslint-disable no-unused-vars */
import classNames from 'classnames';
import { TFunction, useTranslation } from 'next-i18next';
import { Message } from 'primereact/message';
import { PropsWithChildren } from 'react';
import { EditorDefinedProps, EditorFactory, EditorFactoryArgs, EditorProps, EditorType } from '../FormEditor/EditorsManager';

export type DisplayerDefinedProps = EditorDefinedProps;
export type DisplayerFactoryArgs<T> = EditorFactoryArgs<T>;
export type DisplayerProps = EditorProps;
// [label text key, widget type, yup or widget props, yup]
export type DisplayerType<T> = EditorType<T>;
export type DisplayerFactory<T> = EditorFactory<T>;
export type DisplayerSpec<T> = DisplayerType<T> | DisplayerFactory<T>;
export type DisplayerSchema<T> = Array<DisplayerSpec<T>>;

export const displayerFactories: Record<string, DisplayerFactory<any>> = {};

const ERROR = (field: string, reason: string) => <Message severity="error" text={`${field}: ${reason}`} />;

export function getDisplayerFromSchema<P>(schema: DisplayerSchema<P>, valueObject: P, trans: TFunction, transLabelPrefix: string) {
  return schema.map((spec) => {
    if (typeof spec === 'string') {
      const field = spec;
      const factory = displayerFactories['text'];
      if (typeof factory == 'function') {
        const props = {};
        return factory(
          {
            field: `${field}`,
            valueObject,
            props,
            trans,
            transLabelPrefix,
            base: {
              inputId: `form-id-${field}`,
              name: `${field}`,
              onChange: null,
              value: valueObject[field],
            },
          },
          false,
        );
      } else {
        return ERROR(trans(`${transLabelPrefix}.${field}`), `Displayer "text" is not found.`);
      }
    } else if (Array.isArray(spec)) {
      const field: any = spec[0];
      const factory = displayerFactories[spec[1] ?? 'text'];
      if (typeof factory == 'function') {
        if (spec[2] && typeof spec[2]['validate'] === 'function') {
          // yup
        } else {
          const props = spec[2] ?? {};
          return factory(
            {
              field: `${field}`,
              valueObject,
              props,
              trans,
              transLabelPrefix,
              base: {
                inputId: `form-id-${field}`,
                name: `${field}`,
                onChange: null,
                value: valueObject[field],
              },
            },
            false,
          );
        }
      } else {
        return ERROR(trans(`${transLabelPrefix}.${field}`), `Displayer "${spec[1]}" is not found.`);
      }
    } else if (typeof spec === 'function') {
      const factory = spec as DisplayerFactory<P>;
      if (typeof factory == 'function') {
        return factory(
          {
            field: '',
            valueObject,
            props: {},
            trans,
            transLabelPrefix,
            base: {
              inputId: '',
              name: '',
              onChange: null,
              value: null,
            },
          },
          false,
        );
      } else {
        return ERROR('Custom Widget Error', 'Custom widget should be a function with type WidgetFactory<T>');
      }
    }
  });
}

export const addDisplayerFactory = (widgetName: string, factory: DisplayerFactory<any>) => {
  displayerFactories[widgetName] = factory;
};

export const getLabelText = ({ field, trans, transLabelPrefix }: DisplayerFactoryArgs<any>) => {
  const toTransalte = `${transLabelPrefix}.${field}`;
  const translated = trans(toTransalte);
  return translated === toTransalte ? field : translated;
};

export const getTransaltedText = (field, trans, transLabelPrefix) => {
  const toTransalte = `${transLabelPrefix}.${field}`;
  const translated = trans(toTransalte);
  return translated === toTransalte ? field : translated;
};

export const DisplayerWrapper = ({
  wfArgs,
  children,
  field,
  border = false,
}: PropsWithChildren<{
  wfArgs: DisplayerFactoryArgs<any>;
  field?: string;
  border?: boolean;
}>) => {
  if (field) {
    wfArgs.field = field;
    wfArgs.base.name = field;
    wfArgs.base.inputId = `form-id-${field}`;
    wfArgs.base.value = wfArgs.valueObject[field];
  }
  const { t } = useTranslation('Form');
  return (
    <>
      <label style={{ lineHeight: 2, fontWeight: 'bold', fontSize: 16 }}>{getLabelText(wfArgs)}</label>
      <div className={classNames({ 'p-inputtext': border })}>{children}</div>
      {wfArgs.props.children}
    </>
  );
};
