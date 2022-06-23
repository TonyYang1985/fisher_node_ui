import { globalStorage } from '@fot/globalstorage';
import { useTranslation } from 'next-i18next';
import { confirmDialog } from 'primereact/confirmdialog';
import { useEffect } from 'react';
import { CONSTS } from '../const';

export const ConfirmModal = () => {
  const { t } = useTranslation(['common']);

  useEffect(() => {
    const handler = (callback: (isCanceled: boolean) => void, header?: string, message?: string) => {
      confirmDialog({
        header: header ?? t('ConfirmModal.defaultHeader'),
        message: message ?? t('ConfirmModal.defaultContent'),
        icon: 'pi pi-question-circle',
        accept: () => callback(false),
        reject: () => callback(true),
      });
    };
    globalStorage.events.on(CONSTS.FOT.ConfirmModalOpen + CONSTS.FOT.GlobalConfirm, handler);
    return () => {
      globalStorage.events.off(CONSTS.FOT.ConfirmModalOpen + CONSTS.FOT.GlobalConfirm, handler);
    };
  });
  return null;
};
