/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
import classNames from 'classnames';
import dayjs from 'dayjs';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { TFunction, useTranslation } from 'next-i18next';
import { NextRouter, useRouter } from 'next/router';
import { Button } from 'primereact/button';
import { Checkbox } from 'primereact/checkbox';
import { Column, ColumnProps, ColumnSelectionModeType } from 'primereact/column';
import { DataTable, DataTableProps } from 'primereact/datatable';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { MenuItemCommandParams } from 'primereact/menuitem';
import { Toolbar } from 'primereact/toolbar';
import React, { PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react';
import Highlighter from 'react-highlight-words';
import { addDisplayerFactory, addWidgetFactory, FormLibMode, FormLibPlugin, FormLibProps } from '../../components/Form';
import { PropsWithTrans } from '../../i18n';
import { getSort, getSortField, isDesc, PaginationIn, PaginationOut, parseQuery, Query } from '../../Pagination';
import { DataSource, DataSourceProps } from '../DataSource';
import { ActionMenu, ActionMenuItem } from './ActionMenu';
import { ConfirmationButton } from './ConfirmationButton';
import { FormLibSupportState, getForm } from './FormLibSupports';

export const DEFAULT_PAGE_SIZE = 15;
export const DEFAULT_ROWS_PER_PAGE_OPTIONS = [15, 25, 50, 100];

export type TableUIData<T> = {
  rowData?: T;
  pageData: T[];
  selectedItems: T[];
  done: () => void;
};

export type TheTableProps<T, S> = {
  name: string;
  rowsPerPageOptions?: number[];
  actionMenuWidth?: number;
  actionMenuItems?: ActionMenuItem<T>[];
  labelTransPrefix: string;
  defaultSearchValue?: Partial<S>;
  header?: string;
  globalSearch?: boolean;
  dataKey?: string;
  selectMode?: ColumnSelectionModeType;
  dataSourceProps: (query: Query<S>) => DataSourceProps<any>;
  columnsProps: (ColumnProps & { highLight?: boolean })[];
  addingForm?: (arg: TableUIData<T>) => Partial<PropsWithChildren<PropsWithTrans<FormLibProps<T>>>>;
  editingForm?: (arg: TableUIData<T>) => Partial<PropsWithChildren<PropsWithTrans<FormLibProps<T>>>>;
  viewingForm?: (arg: TableUIData<T>) => Partial<FormLibProps<T>>;
  onFormInitial?: (plugin: FormLibPlugin) => void;
  addingUI?: (arg: TableUIData<T>) => React.ReactNode;
  editingUI?: (arg: TableUIData<T>) => React.ReactNode;
  viewingUI?: (arg: TableUIData<T>) => React.ReactNode;
  uiWidth?: number | string;
  addingUIWidth?: number | string;
  editingUIWidth?: number | string;
  viewingUIWidth?: number | string;
  onDel?: (arg: TableUIData<T>) => void;
  onRowClick?: (arg: TableUIData<T>) => void;
  leftToolbar?: (arg: TableUIData<T>) => React.ReactNode;
  rightToolbar?: (arg: TableUIData<T>) => React.ReactNode;
  dataTableProps?: DataTableProps;
  createdDateField?: string;
  routerDriver?: 'nextjsRouter' | 'hooksState';
  card?: boolean;
  actionMenuStyle?: 'Single' | 'Expanded';
  paginator?: 'Long' | 'Short' | 'None';
  operationsColumnWidth?: number | string;
};

export function TheTable<T, S extends PaginationIn>({
  name = `TableDS#${nanoid()}`,
  rowsPerPageOptions,
  actionMenuWidth = 100,
  actionMenuItems,
  labelTransPrefix,
  children,
  useTranslation: useT,
  defaultSearchValue,
  header: headerText,
  globalSearch,
  dataKey,
  dataSourceProps,
  columnsProps,
  selectMode,
  addingUI,
  editingUI,
  viewingUI,
  uiWidth = 600,
  addingUIWidth,
  editingUIWidth,
  viewingUIWidth,
  onDel,
  leftToolbar,
  rightToolbar,
  onRowClick,
  addingForm,
  editingForm,
  viewingForm,
  onFormInitial,
  dataTableProps,
  createdDateField = 'createdAt',
  routerDriver = 'nextjsRouter',
  card = true,
  actionMenuStyle = 'Single',
  paginator = 'Long',
  operationsColumnWidth = 90,
}: PropsWithChildren<PropsWithTrans<TheTableProps<T, S>>>) {
  const [selectedItems, setSelectedItems] = useState<T[]>([]);
  const [addDialog, setAddDialog] = useState<boolean>(false);
  const [viewDialog, setViewDialog] = useState<boolean>(false);
  const [editDialog, setEditDialog] = useState<boolean>(false);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [enableSelection, setEnableSelection] = useState<boolean>(false);
  const [store, setStore] = useState<any>({});

  const editingRowData = useRef<any>();
  const searchTimer = useRef<any>();
  const searchValueRef = useRef<any>('');

  const { t: __t } = useTranslation(typeof useT === 'undefined' || typeof useT === 'function' ? [] : useT);
  const trans: TFunction = typeof useT === 'function' ? useT : __t;

  const _router: NextRouter = useRouter();

  const router = useMemo(() => {
    const handler = async ({ query }) => {
      if (JSON.stringify(store) !== JSON.stringify(query)) {
        setStore(_.assign({}, store, query));
      }
      return true;
    };
    return routerDriver === 'nextjsRouter' ? _router : { query: store, replace: handler, push: handler };
  }, [_router, routerDriver, store]);

  useEffect(() => {
    const defaultQuery = { recordIndex: 0, pageSize: DEFAULT_PAGE_SIZE, ...(defaultSearchValue ?? {}) };
    if (_.isEmpty(router.query['recordIndex']) && _.isEmpty(router.query['pageIndex'])) {
      router.replace({ query: { ...router.query, ...defaultQuery } });
    }
    setSearchValue(router.query['search'] ?? '');
    searchValueRef.current = router.query['search'] ?? '';
  }, [defaultSearchValue, router]);

  const searchVo = parseQuery<S>(router);

  if (onFormInitial) {
    onFormInitial({ addEditor: addWidgetFactory, addDisplayer: addDisplayerFactory });
  }

  let add = addingUI;
  if (!_.isNil(addingForm)) {
    add = (arg) => {
      return getForm(name, addingForm(arg), trans, labelTransPrefix, arg.done, FormLibSupportState.adding, searchVo, FormLibMode.EDIT, addingUIWidth ?? uiWidth, createdDateField);
    };
  }

  let edit = editingUI;
  if (!_.isNil(editingForm)) {
    edit = (arg) => {
      return getForm(name, editingForm(arg), trans, labelTransPrefix, arg.done, FormLibSupportState.editing, searchVo, FormLibMode.EDIT, editingUIWidth ?? uiWidth, createdDateField);
    };
  }

  let view = viewingUI;
  if (!_.isNil(viewingForm)) {
    view = (arg) => {
      return getForm(name, viewingForm(arg), trans, labelTransPrefix, arg.done, FormLibSupportState.editing, searchVo, FormLibMode.VIEW, viewingUIWidth ?? uiWidth, createdDateField);
    };
  }

  const header = (
    <div className="table-header">
      <div className="p-d-flex p-flex-column">
        <h4 className="p-m-0">
          {headerText ? (
            <>
              <i className="bi bi-bookmark-fill p-mr-2" style={{ color: '#2196F3' }} />
              {trans(headerText)}
            </>
          ) : null}
        </h4>
        {selectMode ? (
          <div className="p-mt-3 p-d-inline-flex">
            <Checkbox
              inputId="selectCB"
              checked={enableSelection}
              className="p-mr-1"
              onChange={(e) => {
                if (!e.value) {
                  setSelectedItems([]);
                }
                setEnableSelection(!enableSelection);
              }}
            />
            <label htmlFor="selectCB" className="p-checkbox-label">
              {trans('Table:select')}
            </label>
          </div>
        ) : null}
      </div>
      {globalSearch ? (
        <div className="p-d-flex p-flex-column">
          <small style={{ textAlign: 'right', paddingRight: 5 }}>{trans('Table:Search.help')}</small>
          <span className="p-input-icon-left">
            <i className="pi pi-search" />
            <InputText
              style={{ width: 300 }}
              value={searchValue ?? ''}
              onFocus={({ target }) => target.select()}
              onChange={(e) => {
                setSearchValue(e.target.value);
                searchValueRef.current = e.target.value;
                clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(() => {
                  searchVo.str('search', e.target.value);
                }, 500);
              }}
              placeholder={trans('Table:Search.placeholder')}
            />
          </span>
        </div>
      ) : null}
    </div>
  );

  const toolbarButtons = (data: any, selected: any) => {
    return (
      <>
        {add ? (
          <>
            <Button
              type="button"
              label={trans('Table:new')}
              icon="pi pi-plus"
              className="p-button-success p-mr-2 p-mb-2"
              onClick={() => {
                setAddDialog(true);
              }}
            />
            <Dialog
              visible={addDialog}
              header={`${headerText ? trans(headerText) : ''} - ${trans('Table:new')}`}
              modal
              className="p-fluid"
              onHide={() => {
                setAddDialog(false);
              }}
            >
              {add({
                rowData: undefined,
                pageData: data,
                selectedItems,
                done: () => setAddDialog(false),
              })}
            </Dialog>
          </>
        ) : null}
        {onDel && selectMode ? (
          <ConfirmationButton
            label={trans('Table:delete.label')}
            message={trans('Table:delete.message')}
            icon="pi pi-trash"
            className="p-button-danger p-mr-2 p-mb-2"
            disabled={_.isEmpty(selected) || deleting}
            loading={deleting}
            onClick={(e) => {
              setDeleting(true);
              onDel({
                rowData: undefined,
                pageData: data,
                selectedItems: selectedItems,
                done: () => {
                  setSelectedItems([]);
                  setDeleting(false);
                },
              });
            }}
          />
        ) : null}
        {leftToolbar ? leftToolbar({ rowData: undefined, pageData: data, selectedItems, done: () => setSelectedItems([]) }) : undefined}
      </>
    );
  };

  return (
    <DataSource {..._.assign({}, dataSourceProps(searchVo), { name })}>
      <DataSource.Data>
        {(pData: PaginationOut<T> | Array<T>) => {
          const { data, totalRecords } = Array.isArray(pData) ? { data: pData, totalRecords: -1 } : pData;
          return (
            <div className={classNames('crud-demo', { card })}>
              {leftToolbar || rightToolbar || add || onDel ? (
                <Toolbar
                  className="p-toolbar"
                  left={toolbarButtons(data, selectedItems)}
                  right={rightToolbar ? rightToolbar({ rowData: undefined, pageData: data, selectedItems, done: () => { } }) : undefined}
                />
              ) : null}
              {children}
              <DataTable
                stripedRows
                value={data}
                selection={selectedItems}
                onSelectionChange={(e) => setSelectedItems(e.value)}
                dataKey={dataKey}
                paginator={paginator !== 'None'}
                lazy
                rows={searchVo.num('pageSize')}
                first={searchVo.num('recordIndex')}
                totalRecords={totalRecords}
                rowsPerPageOptions={rowsPerPageOptions ?? DEFAULT_ROWS_PER_PAGE_OPTIONS}
                className={classNames('datatable-responsive', 'hoverTable')}
                paginatorTemplate={paginator === 'Long' ? 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown' : 'PrevPageLink NextPageLink'}
                currentPageReportTemplate={trans('Table:Pagination.showPageSize')}
                emptyMessage={trans('Table:Pagination.emptyData')}
                header={header}
                onPage={({ first, rows }) => {
                  router.push({ query: Object.assign({}, searchVo.raw(), { recordIndex: `${first}`, pageSize: rows }) });
                }}
                onSort={({ sortField, sortOrder }) => {
                  router.push({ query: Object.assign({}, searchVo.raw(), getSort(sortField, sortOrder)) });
                }}
                sortField={getSortField(searchVo.str('sort'))}
                sortOrder={isDesc(searchVo.str('sort')) ? -1 : 1}
                rowClassName={(rowData) => {
                  if (!_.isEmpty(createdDateField) && !_.isNil(rowData[createdDateField])) {
                    return { rowhighlight: dayjs().diff(rowData[createdDateField]) < 5000 };
                  } else {
                    return {};
                  }
                }}
                onRowClick={({ data: rowData }) => {
                  if (onRowClick && !enableSelection) {
                    onRowClick({
                      rowData,
                      pageData: data,
                      selectedItems,
                      done: () => { },
                    });
                  }
                  if (view && !enableSelection) {
                    editingRowData.current = view({
                      rowData,
                      pageData: data,
                      selectedItems,
                      done: () => {
                        setViewDialog(false);
                      },
                    });
                    setViewDialog(true);
                  }
                }}
                {...dataTableProps}
              >
                {selectMode && enableSelection ? <Column selectionMode={selectMode} headerStyle={{ width: '3rem' }} /> : null}
                {columnsProps.map((p, i) => {
                  if (p['field'] && !p['header']) {
                    p['header'] = trans(`${labelTransPrefix}.${p['field']}`);
                  }
                  if (!p['body'] && p['highLight']) {
                    p['body'] = (value) => {
                      return <Highlighter searchWords={searchValueRef.current.split(' ')} autoEscape={true} textToHighlight={value[p['field']!] ?? ''} />;
                    };
                  }
                  return <Column key={nanoid()} {...p} {...{ className: classNames(p.className) }} />;
                })}
                {!_.isEmpty(actionMenuItems) || edit || onDel ? (
                  <Column
                    header={trans('Table:operations')}
                    className="p-text-center p-text-nowrap"
                    style={{ width: operationsColumnWidth }}
                    body={(rowData) => {
                      const items = [...(actionMenuItems ?? [])].map((i) => _.clone(i));

                      if (edit) {
                        items.unshift({
                          label: trans('Table:edit'),
                          icon: 'pi bi-pencil-square',
                          command: (_) => {
                            editingRowData.current = edit!({
                              rowData: rowData,
                              pageData: data,
                              selectedItems,
                              done: () => {
                                setEditDialog(false);
                              },
                            });
                            setEditDialog(true);
                          },
                        });
                      }

                      if (onDel) {
                        items.push({
                          label: trans('Table:delete.label'),
                          icon: 'bi bi-trash',
                          props: {
                            style: actionMenuStyle === 'Expanded' ? { color: '#FF0033' } : { backgroundColor: '#ff8a65' },
                          },
                          confirmation: true,
                          command: (_, e: MenuItemCommandParams) => {
                            onDel({
                              rowData: rowData,
                              pageData: data,
                              selectedItems: [rowData],
                              done: () => setSelectedItems([]),
                            });
                          },
                        });
                      }

                      return <ActionMenu model={items} value={rowData} t={trans} width={actionMenuWidth} actionMenuStyle={actionMenuStyle} />;
                    }}
                  />
                ) : null}
              </DataTable>
              {edit ? (
                <Dialog
                  visible={editDialog}
                  header={`${headerText ? trans(headerText) : ''} - ${trans('Table:edit')}`}
                  modal
                  className="p-fluid"
                  onHide={() => {
                    setEditDialog(false);
                  }}
                >
                  {editingRowData.current}
                </Dialog>
              ) : null}
              {view ? (
                <Dialog
                  visible={viewDialog}
                  header={`${headerText ? trans(headerText) : ''} - ${trans('Table:view')}`}
                  modal
                  className="p-fluid"
                  onHide={() => {
                    setViewDialog(false);
                  }}
                >
                  {editingRowData.current}
                </Dialog>
              ) : null}
            </div>
          );
        }}
      </DataSource.Data>
    </DataSource>
  );
}

export const Highlight = ({ text }) => {
  const router = useRouter();
  const search = parseQuery<PaginationIn>(router);
  return <Highlighter searchWords={(search.raw()['search'] ?? '').split(' ')} autoEscape={true} textToHighlight={`${text}`} />;
};
