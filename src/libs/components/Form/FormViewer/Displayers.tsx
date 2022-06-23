import _ from 'lodash';
import { Chip } from 'primereact/chip';
import { Skeleton } from 'primereact/skeleton';
import React, { useEffect, useState } from 'react';
import { formatValue } from 'react-currency-input-field';
import { datetime } from '../../../utils/datetime';
import { resolveValue } from '../../../utils/misc';
import { Icon } from '../../Icon';
import { EditorFactoryArgs } from '../FormEditor';
import { addDisplayerFactory, DisplayerWrapper, getTransaltedText } from '../FormViewer/DisplayerManager';

export const reservedUselessFnForDisplayers = () => {};

export const TextDisplayer = ({ value }: { value: any }) => <div className="p-inputtext">{`${_.isEmpty(value) ? '\u00A0' : value}`}</div>;

export const textDisplayer = (args: EditorFactoryArgs<any>) => {
  return (
    <DisplayerWrapper wfArgs={args}>
      <TextDisplayer value={args.valueObject[args.field]} />
    </DisplayerWrapper>
  );
};

addDisplayerFactory('text', textDisplayer);
addDisplayerFactory('number', textDisplayer);
addDisplayerFactory('time', textDisplayer);
addDisplayerFactory('display', textDisplayer);

addDisplayerFactory('textarea', (args: EditorFactoryArgs<any>) => {
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-inputtext">
        {`${_.isEmpty(args.valueObject[args.field]) ? '\u00A0' : args.valueObject[args.field]}`.split('\n').map((l, i) => (
          <p style={{ wordWrap: 'break-word' }} key={`textLine#${i}`}>
            {l}
          </p>
        ))}
      </div>
    </DisplayerWrapper>
  );
});

addDisplayerFactory('password', (args: EditorFactoryArgs<any>) => {
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-inputtext">**********</div>
    </DisplayerWrapper>
  );
});

addDisplayerFactory('checkbox', (args: EditorFactoryArgs<any>) => {
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-d-inline-flex">
        <Icon name={args.valueObject[args.field] ? 'check-square' : 'square'} size={18}></Icon>
        <div className="p-mb-5 p-ml-2">{getTransaltedText(args.props.label, args.trans, args.transLabelPrefix)}</div>
      </div>
    </DisplayerWrapper>
  );
});

addDisplayerFactory('switch', (args: EditorFactoryArgs<any>) => {
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-d-inline-flex">
        <Icon name={args.valueObject[args.field] ? 'toggle-on' : 'toggle-off'} size={26}></Icon>
        <div className="p-mt-1 p-ml-2">{getTransaltedText(args.props.label, args.trans, args.transLabelPrefix)}</div>
      </div>
    </DisplayerWrapper>
  );
});

const optionsDisplayer = (args: EditorFactoryArgs<any>) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [opts, setOpts] = useState<{ label: string; value: string | number }[]>();
  const { options, ...props } = args.props;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    resolveValue(options).then((inOpt) => {
      setOpts(inOpt);
    });
  }, [options]);

  if (opts) {
    const val = args.valueObject[args.field];
    const typeOfVal = Array.isArray(val) ? 'array' : typeof val === 'string' ? 'string' : 'unknown';
    const items = opts
      .filter((opt) => {
        if (typeOfVal === 'string') {
          return opt.value === val;
        } else if (typeOfVal === 'array') {
          return val.includes(opt.value);
        } else {
          return val?.find((v) => `${v}` == `${opt.value}`);
        }
      })
      .map((o) => o.label);

    return (
      <DisplayerWrapper wfArgs={args}>
        {typeOfVal === 'array' ? (
          <div className="p-d-inline-flex p-flex-wrap p-inputtext">
            {items.map((item, i) => (
              <Chip key={`${args.field}-${i}`} label={getTransaltedText(item, args.trans, args.transLabelPrefix)} className="p-mx-1" />
            ))}
          </div>
        ) : (
          <div className="p-inputtext">
            <Chip label={getTransaltedText(items.join(), args.trans, args.transLabelPrefix)} className="p-mx-1 p-mb-2" />
          </div>
        )}
      </DisplayerWrapper>
    );
  } else {
    return (
      <DisplayerWrapper wfArgs={args}>
        <div className="p-d-flex p-flex-column">
          <Skeleton width="10rem" className="p-m-2" />
          <Skeleton width="10rem" className="p-m-2" />
        </div>
      </DisplayerWrapper>
    );
  }
};
addDisplayerFactory('select', optionsDisplayer);
addDisplayerFactory('radio', optionsDisplayer);
addDisplayerFactory('checkboxes', optionsDisplayer);

addDisplayerFactory('datetime', (args: EditorFactoryArgs<any>) => {
  const { value } = args.base;
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-inputtext">{datetime.toLocalDatetimeString(value)}</div>
    </DisplayerWrapper>
  );
});

addDisplayerFactory('date', (args: EditorFactoryArgs<any>) => {
  const { value } = args.base;
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-inputtext">{datetime.toLocalDateString(value)}</div>
    </DisplayerWrapper>
  );
});

addDisplayerFactory('currency', (args: EditorFactoryArgs<any>) => {
  return (
    <DisplayerWrapper wfArgs={args}>
      <div className="p-inputtext">
        {formatValue({
          value: `${args.valueObject[args.field]}`,
          decimalScale: 2,
          groupSeparator: ',',
          decimalSeparator: '.',
          prefix: args.props.prefix ?? 'S$ ',
        })}
      </div>
    </DisplayerWrapper>
  );
});
