import classNames from 'classnames';
import React from 'react';

export type IconsProps = {
  // https://icons.getbootstrap.com/
  name: string;
  size?: number;
  color?: string;
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;

export const Icon = ({ name, color, size = 14, style = {}, children, className, ...props }: React.PropsWithChildren<IconsProps>) => {
  const iconName = name.startsWith('bi-') ? name : `bi-${name}`;
  return (
    <span className={classNames(`bi ${iconName}`, className)} style={{ fontSize: size, color, ...style }} {...props}>
      {children}
    </span>
  );
};
