import { globalStorage } from '@fot/globalstorage';
import { useTranslation } from 'next-i18next';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { useEffect } from 'react';
import { BaseController } from '../BaseController';
import { CONSTS } from '../const';

export type AlertModalProps = {
  header?: string;
  content?: string;
  name: string;
};

class AlertModalStore {
  header = '';

  content = '';

  confirmButton = '';

  open = false;

  callback = () => {};
}

export class AlertModalController extends BaseController {
  store = this.makeStore(AlertModalStore);

  open() {
    this.store.update({
      open: true,
    });
  }

  close() {
    this.store.update({
      open: false,
    });
  }

  static confirm(name: string, onConfirm: () => void, header?: string, content?: string) {
    globalStorage.events.emit(CONSTS.FOT.AlertModalOpen + name, onConfirm, header, content);
  }
}

export const AlertModal = ({ header, content, name }: AlertModalProps) => {
  const { t } = useTranslation(['common']);
  const ctl = new AlertModalController();

  useEffect(() => {
    ctl.store.update({ header, content });
    const handler = (callback: () => void, header?: string, content?: string) => {
      ctl.store.update({
        callback,
        header,
        content,
        open: true,
      });
    };
    globalStorage.events.on(CONSTS.FOT.AlertModalOpen + name, handler);
    return () => {
      globalStorage.events.off(CONSTS.FOT.AlertModalOpen + name, handler);
    };
  }, [header, content, name]);

  const renderFooter = () => {
    return (
      <div>
        <Button
          label={t('ConfirmModal.confirm')}
          icon="pi pi-check"
          onClick={() => {
            ctl.store.callback();
            ctl.close();
          }}
          autoFocus
        />
      </div>
    );
  };

  return (
    <Dialog
      header={ctl.store.header ?? t('ConfirmModal.defaultHeader')}
      visible={ctl.store.open}
      onHide={() => ctl.close()}
      breakpoints={{ '960px': '75vw' }}
      style={{ width: '30vw' }}
      footer={renderFooter()}
    >
      {ctl.store.content ?? t('ConfirmModal.defaultContent')}
    </Dialog>
  );
};
