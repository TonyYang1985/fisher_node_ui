import classNames from 'classnames';
import { FormikProps } from 'formik';
import _ from 'lodash';
import { TFunction } from 'next-i18next';
import { Message } from 'primereact/message';
import React, { createContext, PropsWithChildren } from 'react';
import { object, ObjectSchema } from 'yup';
import { ObjectShape } from 'yup/lib/object';
import { getLabelText } from '../FormViewer/DisplayerManager';

export const YupSchemaContext = createContext<ObjectSchema<ObjectShape>>(object());

export type EditorDefinedProps = { placeholder?: string; helptext?: React.ReactNode } & Record<string, any>;
export type EditorFactoryArgs<T> = {
  field: string;
  valueObject: T;
  props: EditorProps;
  trans: TFunction;
  transLabelPrefix: string;
  formikProps?: FormikProps<T>;
  base: {
    inputId: string;
    name: string;
    value: any;
    onChange: any;
  };
};
export type EditorProps = React.PropsWithChildren<EditorDefinedProps>;
// [label text key, widget type, yup or widget props, yup]
export type EditorType<T> = [keyof T, string?, EditorProps?] | keyof T;
export type EditorFactory<T> = (args: EditorFactoryArgs<T>, isEditor?: boolean) => React.ReactNode;
export type EditorSpec<T> = EditorType<T> | EditorFactory<T>;
export type EditorSchema<T> = Array<EditorSpec<T>>;

export const editorFactories: Record<string, EditorFactory<any>> = {};

const ERROR = (field: string, reason: string) => <Message severity="error" text={`${field}: ${reason}`} />;

export function getEditorsFromSchema<P>(schema: EditorSchema<P>, valueObject: P, trans: TFunction, transLabelPrefix: string, formikProps: FormikProps<P>) {
  return schema.map((spec) => {
    if (typeof spec === 'string') {
      const field = spec;
      const factory = editorFactories['text'];
      if (typeof factory == 'function') {
        const props = {};
        return factory(
          {
            field: `${field}`,
            valueObject,
            props,
            trans,
            transLabelPrefix,
            formikProps,
            base: {
              inputId: `form-id-${field}`,
              name: `${field}`,
              onChange: formikProps.handleChange,
              value: valueObject[field] ?? '',
            },
          },
          true,
        );
      } else {
        return ERROR(trans(`${transLabelPrefix}.${field}`), `Displayer "text" is not found.`);
      }
    } else if (Array.isArray(spec)) {
      const field = spec[0];
      const factory = editorFactories[spec[1] ?? 'text'];
      if (typeof factory == 'function') {
        const props = spec[2] ?? {};
        return factory(
          {
            field: `${field}`,
            valueObject,
            props,
            trans,
            transLabelPrefix,
            formikProps,
            base: {
              inputId: `form-id-${field}`,
              name: `${field}`,
              onChange: formikProps.handleChange,
              value: valueObject[field] ?? '',
            },
          },
          true,
        );
      } else {
        return ERROR(trans(`${transLabelPrefix}.${field}`), `Widget "${spec[1]}" is not found.`);
      }
    } else if (typeof spec === 'function') {
      const factory = spec as EditorFactory<P>;
      if (typeof factory == 'function') {
        return factory(
          {
            field: '',
            valueObject,
            props: {},
            trans,
            transLabelPrefix,
            formikProps,
            base: {
              inputId: '',
              name: '',
              onChange: formikProps.handleChange,
              value: '',
            },
          },
          true,
        );
      } else {
        return ERROR('Custom Widget Error', 'Custom widget should be a function with type WidgetFactory<T>');
      }
    }
  });
}

export const addWidgetFactory = (widgetName: string, factory: EditorFactory<any>) => {
  editorFactories[widgetName] = factory;
};

// export const isValid = (args: { field: string; formikProps?: FormikProps<any> }) => args.formikProps!.touched[args.field] && !args.formikProps!.errors[args.field];
export const isInvalid = (args: { field: string; formikProps?: FormikProps<any> }) => args.formikProps?.touched[args.field] && !!args.formikProps?.errors[args.field];

export const EditorWrapper = ({
  wfArgs,
  children,
  noValidate = false,
  field,
  helptext,
}: PropsWithChildren<{
  wfArgs: EditorFactoryArgs<any>;
  noValidate?: boolean;
  field?: string;
  helptext?: string;
}>) => {
  if (field) {
    wfArgs.field = field;
    wfArgs.base.name = field;
    wfArgs.base.inputId = `form-id-${field}`;
  }
  if (helptext) {
    wfArgs.props.helptext = helptext;
  }

  return (
    <>
      <label htmlFor={`form-id-${wfArgs.field}`} className={classNames({ 'p-error': isInvalid(wfArgs) })}>
        <span style={{ lineHeight: 2, fontWeight: 'bold', fontSize: 16 }}>{getLabelText(wfArgs)}</span>
        <YupSchemaContext.Consumer>
          {(schema) => {
            const yupField = schema.fields[wfArgs.field] as any;
            if (!yupField) {
              return null;
            }
            if (yupField.spec.presence === 'required') {
              return (
                <span className="p-error" style={{ fontSize: 20 }}>
                  {'*'}
                </span>
              );
            }
          }}
        </YupSchemaContext.Consumer>
      </label>
      {children}
      {_.isEmpty(wfArgs.props.helptext) ? null : <small>{wfArgs.props.helptext}</small>}
      {noValidate ? null : <>{isInvalid(wfArgs) ? <Message severity="error" text={`${wfArgs.formikProps!.errors[wfArgs.field]}`} className="p-mt-2" /> : null}</>}
      {wfArgs.props.children}
    </>
  );
};
