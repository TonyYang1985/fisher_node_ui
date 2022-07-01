import { Button, ButtonProps } from 'primereact/button';
import { ConfirmPopup, ConfirmPopupProps } from 'primereact/confirmpopup';
import React, { useEffect, useRef, useState } from 'react';

export type ConfirmationButtonProps = {
  dialogProps?: ConfirmPopupProps;
  message?: string;
  ref?: any;
} & ButtonProps;

export const ConfirmationButton = ({ dialogProps = {}, message, ref, onClick, ...btProps }: ConfirmationButtonProps) => {
  const buttonNode = useRef<{ node?: HTMLElement; callback?: any; e?: React.MouseEvent<HTMLButtonElement, MouseEvent> }>({});

  const { visible, onHide, message: msg, icon, accept } = dialogProps;
  const [show, setShow] = useState<boolean>(visible ?? false);

  useEffect(() => {
    setShow(visible ?? false);
  }, [visible]);

  return (
    <>
      <Button
        type="button"
        ref={ref}
        {...btProps}
        onClick={(e) => {
          buttonNode.current.node = e.currentTarget;
          buttonNode.current.callback = onClick;
          buttonNode.current.e = e;
          setShow(true);
        }}
      />
      <ConfirmPopup
        target={buttonNode.current.node}
        visible={show}
        onHide={(result) => {
          try {
            if (onHide) {
              onHide(result);
            }
            setShow(false);
          } catch (error) {
            console.log(error);
          }
        }}
        message={message ?? msg}
        icon={icon ?? 'pi pi-exclamation-triangle'}
        accept={() => {
          try {
            if (accept) {
              accept();
            }
            if (buttonNode.current.callback) {
              buttonNode.current.callback(buttonNode.current.e);
            }
          } catch (error) {
            console.log(error);
          }
        }}
      />
    </>
  );
};
