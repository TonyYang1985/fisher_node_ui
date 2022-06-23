import { globalStorage } from '@fot/globalstorage';
import _ from 'lodash';
import { nanoid } from 'nanoid';
import { TFunction } from 'next-i18next';
import { Button } from 'primereact/button';
import { ConfirmPopup } from 'primereact/confirmpopup';
import { Menu, MenuProps } from 'primereact/menu';
import { MenuItemCommandParams } from 'primereact/menuitem';
import { useEffect, useRef, useState } from 'react';

export type FnReturn<T = any, R = any> = (value: T) => R;
export function resolveFnReturn<T = any, R = any>(value: R | FnReturn<R>, data: T): R {
  if (typeof value === 'function') {
    return (value as any)(data);
  } else {
    return value;
  }
}

export type ActionMenuItem<T> = {
  label?: string | FnReturn<T, string>;
  icon?: string | FnReturn<T, string>;
  command?: (rowValue: T, e: MenuItemCommandParams) => void;
  confirmation?: boolean | FnReturn<T, boolean>;
  message?: string | FnReturn<T, string>;
  props?: MenuProps | FnReturn<T, MenuProps>;
};

export type ActionMenuProps<T> = {
  model: ActionMenuItem<T>[];
  value: T;
  t: TFunction;
  width?: number;
  actionMenuStyle?: 'Single' | 'Expanded';
};

export function ActionMenu<T>({ model, value, t, width = 100, actionMenuStyle = 'Single' }: ActionMenuProps<T>) {
  const [id] = useState(nanoid());
  const menu = useRef<Menu>(null);
  const [show, setShow] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    target: HTMLElement | null;
    callback: () => void;
    message?: string;
  }>({
    show: false,
    target: null,
    callback: () => {},
  });

  useEffect(() => {
    const handler = (_id: string, e) => {
      if (_.isEqual(_id, id)) {
        (menu.current as any)?.show(e);
      } else if (show) {
        (menu.current as any)?.hide(e);
      }
    };
    const handler1 = (_id: string, e) => {
      if (_.isEqual(_id, id)) {
        setConfirmDialog({ ...e });
      } else if (confirmDialog.show) {
        setConfirmDialog(_.assign({}, e, { show: false }));
      }
    };
    globalStorage.events.on('ActionMenuPopup', handler);
    globalStorage.events.on('ActionMenuConfirmPopup', handler1);
    return () => {
      globalStorage.events.off('ActionMenuPopup', handler);
      globalStorage.events.off('ActionMenuConfirmPopup', handler1);
    };
  }, [confirmDialog.show, id, show]);

  const confirmPop = (
    <ConfirmPopup
      target={confirmDialog.target ?? undefined}
      visible={confirmDialog.show}
      onHide={() => setConfirmDialog(_.assign({}, confirmDialog, { show: false }))}
      message={t('Table:delete.message')}
      icon="pi pi-exclamation-triangle"
      accept={() => {
        if (confirmDialog.callback) {
          confirmDialog.callback();
        }
      }}
    />
  );

  if (actionMenuStyle === 'Expanded') {
    return (
      <>
        {model.map((item) => {
          return (
            <Button
              type="button"
              key={`${id}.${item.label}`}
              id={`menuBT#${id}.${item.label}`}
              icon={item.icon ? resolveFnReturn<T>(item.icon, value) : undefined}
              tooltip={item.label ? t(resolveFnReturn<T>(item.label, value)) : undefined}
              tooltipOptions={{ position: 'top' }}
              onClick={
                item.command
                  ? (e) => {
                      if (resolveFnReturn<T>(item.confirmation, value)) {
                        globalStorage.events.emit('ActionMenuConfirmPopup', id, {
                          target: document.getElementById(`menuBT#${id}.${item.label}`),
                          callback: () =>
                            item.command!(value, {
                              originalEvent: e,
                              item: item as any,
                            }),
                          show: true,
                          message: resolveFnReturn<T>(item.message ?? t('Table:delete.message'), value),
                        });
                      } else {
                        item.command!(value, {
                          originalEvent: e,
                          item: item as any,
                        });
                      }
                    }
                  : undefined
              }
              className="p-button-rounded p-button-outlined p-mx-1"
              {...item.props}
            />
          );
        })}
        {confirmPop}
      </>
    );
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Menu
        model={model.map((item) =>
          Object.assign(
            {
              label: item.label ? t(resolveFnReturn<T>(item.label, value)) : undefined,
              icon: item.icon ? resolveFnReturn<T>(item.icon, value) : undefined,
              command: item.command
                ? (e: MenuItemCommandParams) => {
                    if (resolveFnReturn<T>(item.confirmation, value)) {
                      globalStorage.events.emit('ActionMenuConfirmPopup', id, {
                        target: document.getElementById(`menuBT#${id}`),
                        callback: () => item.command!(value, e),
                        show: true,
                        message: resolveFnReturn<T>(item.message ?? t('Table:delete.message'), value),
                      });
                    } else {
                      item.command!(value, e);
                    }
                  }
                : undefined,
            },
            resolveFnReturn<T>(item.props, value),
          ),
        )}
        style={{ width }}
        popup
        ref={menu}
        autoZIndex
        onShow={() => setShow(true)}
        onHide={() => {
          setShow(false);
        }}
      />
      <Button
        type="button"
        id={`menuBT#${id}`}
        icon="bi bi-three-dots"
        className="p-button-rounded p-button-help p-button-outlined"
        style={{ width: 30, height: 30 }}
        onClick={(event) => globalStorage.events.emit('ActionMenuPopup', id, event)}
        aria-controls="popup_menu"
        aria-haspopup
      />
      {confirmPop}
    </div>
  );
}
