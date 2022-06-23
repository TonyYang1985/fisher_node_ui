import { URIParam } from '@fot/restclient';
import { FormikHelpers, FormikProps } from 'formik';
import _ from 'lodash';
import { useTranslation } from 'next-i18next';
import { Button } from 'primereact/button';
import React, { PropsWithChildren } from 'react';
import { ObjectSchema } from 'yup';
import { ObjectShape } from 'yup/lib/object';
import { BaseController } from '../../BaseController';
import { FormUtils } from '../../FormUtils';
import { PropsWithTrans } from '../../i18n';
import { restClient } from '../../RC';
import { resolveValue } from '../../utils/misc';
import { ControllerDS, DataSource, RestClientDS } from '../DataSource';
import { addWidgetFactory, EditorSchema, FormEditor } from './FormEditor';
import { FormViewer } from './FormViewer';
import { addDisplayerFactory, DisplayerSchema } from './FormViewer/DisplayerManager';

export const customWidget = () => {
  //
};

export class FormLibController extends BaseController {
  store = this.makeObjectStore({
    isEditing: false,
  });

  formError = this.useFormError();

  t = this.getT('Form');

  notify() {
    this.success();
  }

  setFormError(e?: any) {
    if (e) {
      this.handleFormError(e, this.formError);
    } else {
      this.clearFormError(this.formError);
    }
  }

  backToView() {
    this.store.update({ isEditing: false });
  }

  edit() {
    this.store.update({ isEditing: true });
  }

  cancelEdit<T>(data: T, values: T) {
    if (!_.isEqual(values, data)) {
      this.confirm(
        (isCanceled) => {
          if (!isCanceled) {
            this.store.update({ isEditing: false });
          }
        },
        this.t('contentChanged'),
        this.t('abortingEdit'),
      );
    } else {
      this.store.update({ isEditing: false });
    }
  }
}

export type DSProps<T> = {
  action?: ControllerDS<T>;
  api?: RestClientDS;
};

export type SaveAtion<T> = (valueObject: T, helper: FormikHelpers<T>) => Promise<void> | void;
export type SavingType<T> = {
  action?: SaveAtion<T>;
  api?: RestClientDS;
};

export type HeaderFooterFn<T> = (valueObject: T, formikProps?: FormikProps<T>) => React.ReactNode;

export type FormLibSchemaType<T> = EditorSchema<T>;

export enum FormLibMode {
  BOTH,
  VIEW,
  EDIT,
}

export type FormLibPlugin = {
  addEditor: typeof addWidgetFactory;
  addDisplayer: typeof addDisplayerFactory;
};

export type FormLibProps<T> = {
  verbose?: boolean;
  name?: string;
  initialValue?: T;
  loadingDs?: DSProps<T>;
  savingDs?: SavingType<T>;
  title?: React.ReactNode | HeaderFooterFn<T>;
  footer?: React.ReactNode | HeaderFooterFn<T>;
  labelTransPrefix: string;
  layout?: number[][];
  displayerSchema?: DisplayerSchema<T>;
  editorSchema?: EditorSchema<T>;
  schema: FormLibSchemaType<T>;
  validation?: ObjectSchema<ObjectShape>;
  onCancel?: (data: T, values: T) => void;
  onLoad?: (value?: unknown) => void | T;
  onSubmit?: (value: T) => boolean;
  afterSubmit?: (value: T, response: any) => void;
  onValidate?: (value: T) => boolean;
  onInitial?: (plugin: FormLibPlugin) => void;
  width?: number | string;
  mode?: FormLibMode;
  compact?: boolean;
};

function displayerFooterEditorButtonFn<T>(valueObject: T, onEdit: () => void) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { t } = useTranslation('Form');
  return (
    <div className="p-d-flex p-jc-center">
      <Button icon="pi pi-pencil" type="button" label={t('edit')} onClick={onEdit} />
    </div>
  );
}

export function FormLibDisplayer<T>(props: PropsWithChildren<PropsWithTrans<FormLibProps<T>>> & { readOnly: boolean; ctl: FormLibController }) {
  const { loadingDs, savingDs, displayerSchema, editorSchema, schema, onLoad, ctl, onSubmit, onValidate, validation, initialValue, ...formProps } = props;

  const loadForm = (data: T) => (
    <FormViewer
      vauleObject={data}
      schema={[...schema, ...(displayerSchema ?? [])]}
      {...formProps}
      footer={(vauleObject) =>
        !props.readOnly ? (
          <>
            {displayerFooterEditorButtonFn(vauleObject, () => {
              ctl.edit();
            })}
          </>
        ) : null
      }
    />
  );

  return _.isNil(initialValue) ? (
    <DataSource rcDs={loadingDs?.api} ctlDs={loadingDs?.action} onLoad={onLoad}>
      <DataSource.Data>{(data: T) => loadForm(data)}</DataSource.Data>
    </DataSource>
  ) : (
    loadForm(initialValue)
  );
}

export function FormLibEditor<T>({
  loadingDs,
  savingDs,
  displayerSchema,
  editorSchema,
  schema,
  validation,
  onLoad,
  ctl,
  onSubmit = () => true,
  onValidate = () => true,
  afterSubmit,
  onCancel,
  initialValue,
  ...formProps
}: PropsWithChildren<PropsWithTrans<FormLibProps<T>>> & { ctl: FormLibController }) {
  const { t } = useTranslation('formError');

  const saveForm = (data: T) => (
    <FormEditor
      vauleObject={data}
      schema={[...schema, ...(editorSchema ?? [])]}
      validationSchema={validation}
      {...formProps}
      onCancel={(values) => {
        if (onCancel) {
          onCancel(data, values);
        } else {
          ctl.cancelEdit(data, values);
        }
      }}
      onSubmit={(value, helper) => {
        ctl.setFormError();
        resolveValue(onSubmit(value))
          .then((isContinue) => {
            if (isContinue) {
              if (savingDs && savingDs.action) {
                return savingDs.action(value, helper);
              }
              if (savingDs && savingDs.api && typeof savingDs.api === 'string') {
                return restClient.call(savingDs.api, undefined, undefined, value);
              }
              if (savingDs && savingDs.api && Array.isArray(savingDs.api)) {
                const [api, param] = savingDs.api;
                return restClient.call(api, param.pathParam as URIParam, param.urlParam as URIParam, value);
              }
            }
          })
          .then((result) => {
            helper.setSubmitting(false);
            ctl.notify();
            if (_.isNil(initialValue)) {
              ctl.backToView();
            }
            if (afterSubmit) {
              afterSubmit(value, result);
            }
          })
          .catch((e) => {
            helper.setSubmitting(false);
            ctl.setFormError(e);
            const { formError } = ctl;
            if (formError.fieldMessages && !_.isEmpty(formError.fieldMessages)) {
              Object.keys(formError.fieldMessages).forEach((field) => {
                const formattedMsgs = FormUtils.formatFormFieldError(t, formError.fieldMessages![field]);
                helper.setFieldError(field, formattedMsgs.join('\n'));
              });
            }
          });
      }}
    >
      {(widget) => {
        return (
          <>
            {widget}
            {_.isEmpty(ctl.formError?.formMessages) ? null : (
              <div className="p-d-flex p-jc-center">
                <div className="p-mr-2">
                  <FormUtils.FormErrors formError={ctl.formError} i18nNS="formError" />
                </div>
              </div>
            )}
          </>
        );
      }}
    </FormEditor>
  );

  return _.isNil(initialValue) ? (
    <DataSource rcDs={loadingDs?.api} ctlDs={loadingDs?.action} onLoad={onLoad} options={{ revalidateOnFocus: false }}>
      <DataSource.Data>{(data: T) => saveForm(data)}</DataSource.Data>
    </DataSource>
  ) : (
    saveForm(initialValue)
  );
}

export function FormLib<T>({ onInitial, width, mode = FormLibMode.BOTH, ...props }: PropsWithChildren<PropsWithTrans<FormLibProps<T>>>) {
  if (onInitial) {
    onInitial({ addEditor: addWidgetFactory, addDisplayer: addDisplayerFactory });
  }
  const ctl = new FormLibController();

  if (mode === FormLibMode.EDIT) {
    return (
      <div {...(width ? { style: { width } } : {})}>
        <FormLibEditor {...props} ctl={ctl} />
      </div>
    );
  } else if (mode === FormLibMode.VIEW) {
    return (
      <div {...(width ? { style: { width } } : {})}>
        <FormLibDisplayer {...props} ctl={ctl} readOnly />
      </div>
    );
  } else {
    return <div {...(width ? { style: { width } } : {})}>{ctl.store.isEditing ? <FormLibEditor {...props} ctl={ctl} /> : <FormLibDisplayer {...props} ctl={ctl} readOnly={false} />}</div>;
  }
}
