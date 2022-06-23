import { Formik, FormikErrors, FormikHelpers, FormikProps } from 'formik';
import _ from 'lodash';
import { TFunction, useTranslation } from 'next-i18next';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import React, { PropsWithChildren } from 'react';
import { object, ObjectSchema } from 'yup';
import { ObjectShape } from 'yup/lib/object';
import { PropsWithTrans } from '../../../i18n';
import { NotifierController } from '../../Notifier';
import { FormGrid } from '../FormGrid';
import { EditorSchema, getEditorsFromSchema, YupSchemaContext } from './EditorsManager';

export type FormEditorHeaderFooterFn<P> = (valueObject: P, formikProps: FormikProps<P>) => React.ReactNode;

export type FormEditorProps<P> = {
  title?: React.ReactNode | FormEditorHeaderFooterFn<P>;
  footer?: React.ReactNode | FormEditorHeaderFooterFn<P>;
  vauleObject: P;
  layout?: number[][];
  schema: EditorSchema<P>;
  onSubmit?: (values: P, formikHelpers: FormikHelpers<P>) => void | Promise<any>;
  onCancel?: (values: P) => void;
  validationSchema?: ObjectSchema<ObjectShape>;
  labelTransPrefix?: string;
  verbose?: boolean;
  compact?: boolean;
  props?: any;
};

function FormFooterButtons<V>({ formikProps: { isSubmitting, isValidating, values }, formProps: { onCancel } }: { formikProps: FormikProps<V>; formProps: FormEditorProps<V> }) {
  const acting = isSubmitting || isValidating;
  const { t } = useTranslation('Form');
  return (
    <div className="p-d-flex p-jc-center">
      {onCancel ? (
        <Button
          id="form_cancel"
          icon="bi bi-x-circle"
          type="button"
          label={t('cancel')}
          disabled={acting}
          className="p-button-outlined p-m-1"
          onClick={(e) => {
            if (onCancel) onCancel(values);
          }}
        />
      ) : null}
      <Button id="form_submit" type="submit" icon="pi pi-save" className="p-m-1" label={t('save')} disabled={acting} loading={acting} />
    </div>
  );
}

export const scrollToErrors = (errors: FormikErrors<any>) => {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length > 0) {
    const element = document.getElementsByName(errorKeys[0])[0] ?? document.getElementById(errorKeys[0]);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
};

export function FormEditor<V>(props: PropsWithChildren<PropsWithTrans<FormEditorProps<V>>>) {
  const { title, footer, labelTransPrefix: transLabelPrefix = '', schema, layout, verbose = false, onSubmit, vauleObject, useTranslation: useT, validationSchema, children, compact } = props;
  const { t: __t } = useTranslation(typeof useT === 'undefined' || typeof useT === 'function' ? [] : useT);
  const trans: TFunction = typeof useT === 'function' ? useT : __t;

  return (
    <Formik
      validationSchema={validationSchema}
      onSubmit={(value, helper) => {
        if (onSubmit) onSubmit(value, helper);
      }}
      initialValues={vauleObject}
    >
      {(formikProps: FormikProps<V>) => {
        const { handleSubmit, handleReset, handleBlur, values } = formikProps;
        const items = getEditorsFromSchema<V>(schema, values, trans, transLabelPrefix, formikProps);
        const widgets = <FormGrid layout={layout} items={items} verbose={verbose} />;

        let cardHeader: React.ReactNode = title;
        if (title) {
          if (typeof title === 'string') {
            cardHeader = trans(title);
          } else if (typeof title === 'function') {
            cardHeader = title(vauleObject, formikProps);
          }
        }
        let cardFooter: React.ReactNode = footer;
        if (!cardFooter) {
          cardFooter = <FormFooterButtons formProps={props} formikProps={formikProps} />;
        }

        if (compact) {
          return (
            <YupSchemaContext.Provider value={validationSchema ?? object()}>
              <div {...(props.props ?? {})}>
                <form id="FormEditorForm" onSubmit={handleSubmit} onReset={handleReset} onBlur={handleBlur} noValidate>
                  <div>{typeof children === 'function' ? children(widgets) : widgets}</div>
                  <div className="text-center">{typeof cardFooter === 'function' ? cardFooter(vauleObject, formikProps) : cardFooter}</div>
                  {verbose ? (
                    <>
                      <hr />
                      <pre>{JSON.stringify(values, null, 2)}</pre>
                    </>
                  ) : null}
                </form>
              </div>
            </YupSchemaContext.Provider>
          );
        }

        return (
          <YupSchemaContext.Provider value={validationSchema ?? object()}>
            <form
              id="FormEditorForm"
              onSubmit={(e) => {
                formikProps.validateForm().then((errors) => {
                  Object.keys(errors).forEach((key) => {
                    formikProps.setFieldTouched(key, true, false);
                  });
                  if (!_.isEmpty(errors)) {
                    NotifierController.notify('warn', trans('Form:validationError'));
                    scrollToErrors(errors);
                  } else {
                    handleSubmit(e);
                  }
                });
                e.preventDefault();
              }}
              onReset={handleReset}
              onBlur={handleBlur}
              noValidate
            >
              <Card
                title={typeof cardHeader === 'function' ? cardHeader(vauleObject, formikProps) : cardHeader}
                footer={typeof cardFooter === 'function' ? cardFooter(vauleObject, formikProps) : cardFooter}
                {...(props.props ?? {})}
              >
                {typeof children === 'function' ? children(widgets) : widgets}
                {verbose ? (
                  <Card title="Form Values">
                    <pre>{JSON.stringify(values, null, 2)}</pre>
                  </Card>
                ) : null}
              </Card>
            </form>
          </YupSchemaContext.Provider>
        );
      }}
    </Formik>
  );
}
