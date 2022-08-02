import { classNames, ObjectUtils } from 'primereact/utils';

export class IconUtils {
  static getJSXIcon(icon, iconProps: any = {}, options: any = {}) {
    if (icon !== null) {
      const iconType = typeof icon;
      const className = classNames(iconProps.className, iconType === 'string' && icon);
      const content = <span {...iconProps} className={className}></span>;
      if (iconType !== 'string') {
        const defaultContentOptions = {
          iconProps: iconProps,
          element: content,
          ...options,
        };

        return ObjectUtils.getJSXElement(icon, defaultContentOptions);
      }
    } else {
      return null;
    }
  }
}
