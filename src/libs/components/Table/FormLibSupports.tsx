import { TFunction } from 'next-i18next';
import { PropsWithChildren } from 'react';
import { PropsWithTrans } from '../../i18n';
import { PaginationIn, Query } from '../../Pagination';
import { DataSource } from '../DataSource';
import { EditorFactoryArgs, EditorWrapper } from '../Form/FormEditor/EditorsManager';
import { FormLib, FormLibMode, FormLibPlugin, FormLibProps } from '../Form/FormLib';
import { textDisplayer } from '../Form/FormViewer/Displayers';
import { TimeZoneSelector } from '../TimeZoneSelector';

export const enableTimezoneSelector = ({ addDisplayer, addEditor }: FormLibPlugin) => {
  addDisplayer('timezone', textDisplayer);
  addEditor('timezone', (args: EditorFactoryArgs<any>) => {
    return (
      <EditorWrapper wfArgs={args}>
        <TimeZoneSelector
          value={args.valueObject[args.field]}
          onChange={(e) => {
            args.formikProps?.setFieldValue(args.field, e.value);
            args.formikProps!.setFieldTouched(args.field, true);
          }}
        />
      </EditorWrapper>
    );
  });
};

export enum FormLibSupportState {
  adding,
  editing,
  viewing,
}

export function getForm<T, S extends PaginationIn>(
  tableName: string,
  formProps: Partial<PropsWithChildren<PropsWithTrans<FormLibProps<T>>>>,
  t: TFunction,
  labelTransPrefix: string,
  done: () => void,
  state: FormLibSupportState,
  search: Query<S>,
  mode: FormLibMode,
  width: number | string,
  createdDateField: string,
) {
  const lines = (formProps.schema ?? []).length / 2 + 1;
  const layout: number[][] = [];
  for (let i = 0; i < lines; i++) {
    layout.push([6, 6]);
  }
  const { initialValue, useTranslation, labelTransPrefix: _labelTransPrefix, layout: _layout, savingDs, loadingDs, schema, validation, compact, ...fprops } = formProps;
  return (
    <div style={{ width }}>
      <FormLib<T>
        initialValue={initialValue}
        mode={mode}
        afterSubmit={() => {
          done();
          if (state === FormLibSupportState.adding) {
            setTimeout(() => {
              const sort = search.str('sort');
              search.set({ pageSize: search.str('pageSize'), recordIndex: 0, sort: `!${createdDateField}` } as any).then((result) => {
                if (sort === `!${createdDateField}`) {
                  DataSource.reload(tableName);
                }
              });
            }, 300);
          } else if (state === FormLibSupportState.editing) {
            DataSource.reload(tableName);
          }
        }}
        useTranslation={useTranslation ?? t}
        labelTransPrefix={_labelTransPrefix ?? labelTransPrefix}
        onCancel={done}
        layout={_layout ?? layout}
        savingDs={savingDs}
        loadingDs={loadingDs}
        schema={schema ?? []}
        validation={validation}
        compact={compact ?? true}
        {...fprops}
      />
    </div>
  );
}
