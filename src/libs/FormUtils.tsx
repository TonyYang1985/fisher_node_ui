/* eslint-disable prettier/prettier */
/* eslint-disable import/no-duplicates */
/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react';
import { FormikProps } from 'formik';
import _ from 'lodash';
import { TFunction, useTranslation } from 'next-i18next';
import { Message } from 'primereact/message';
import { Messages } from 'primereact/messages';
import { useEffect, useRef } from 'react';
import { FormError } from './FormError';

function doWithFormik<T>(formikProps: FormikProps<T>) {
  const api = {
    isInvalid: (field: keyof T) => {
      return !!(formikProps.touched[field] && formikProps.errors[field]);
    },
    getFormErrorMessage: (field: keyof T, simple = false) => {
      if (simple) {
        return api.isInvalid(field) && <small className="p-error">{formikProps.errors[field]}</small>;
      } else {
        return api.isInvalid(field) && <Message severity="error" text={`${formikProps.errors[field]}`} className="p-mt-2" />;
      }
    },
  };

  return api;
}

export type FormErrorsProps = {
  formError?: FormError;
  i18nNS?: string | string[];
};

function FormErrors({ formError, i18nNS = 'formError' }: FormErrorsProps) {
  const { t } = useTranslation(i18nNS);
  const errorMsg = useRef<Messages>(null);
  const lastErrorMsgs = useRef<string>('');

  useEffect(() => {
    if (formError) {
      const msgs = formError.formMessages
        .map((msg, i) => {
          return t(`${i18nNS}:${msg}`);
        })
        .map((msg) => ({ severity: 'error', detail: msg, sticky: true, closable: false }));
      if (JSON.stringify(msgs) !== lastErrorMsgs.current) {
        lastErrorMsgs.current = JSON.stringify(msgs);
        errorMsg.current?.replace(msgs);
      }
    }
  }, [formError, i18nNS, t]);

  if (formError && _.isEmpty(formError.formMessages)) {
    return null;
  }

  // return (
  //   <div className="p-d-flex p-flex-column">
  //     {formError!.formMessages.map((msg, i) => {
  //       return (
  //         <div className="p-error" key={`ErrorMessage.${i}`}>
  //           <Icon name="exclamation-circle">{t(`${i18nNS}:${msg}`)}</Icon>
  //           <Messages ref={errorMsg} />
  //         </div>
  //       );
  //     })}
  //   </div>
  // );
  return <Messages ref={errorMsg} />;
}

function formatFormFieldError(t: TFunction, msgs: any[][]) {
  return msgs.map((msg) => {
    return t(msg[0], msg[1]);
  });
}

export const FormUtils = {
  doWithFormik,
  FormErrors,
  formatFormFieldError,
};
