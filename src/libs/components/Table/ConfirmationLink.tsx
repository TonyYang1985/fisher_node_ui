import { ConfirmPopup, ConfirmPopupProps } from 'primereact/confirmpopup';
import React, { useEffect, useRef, useState } from 'react';

export type ConfirmationLinkProps = {
  dialogProps?: ConfirmPopupProps;
  linkProps?: any;
  message?: string;
} & React.DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;

export const ConfirmationLink = ({ dialogProps = {}, message, ref, onClick, children, ...anchorProps }: ConfirmationLinkProps) => {
  const buttonNode = useRef<{ node?: HTMLAnchorElement; callback?: any; e?: React.MouseEvent<HTMLAnchorElement, MouseEvent> }>({});

  const { visible, onHide, message: msg, icon, accept } = dialogProps;
  const [show, setShow] = useState<boolean>(visible ?? false);

  useEffect(() => {
    setShow(visible ?? false);
  }, [visible]);

  return (
    <>
      <a
        style={{ cursor: 'pointer' }}
        ref={ref as any}
        {...anchorProps}
        onClick={(e) => {
          buttonNode.current.node = e.currentTarget;
          buttonNode.current.callback = onClick;
          buttonNode.current.e = e;
          setShow(true);
        }}
      >
        {children}
      </a>
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
