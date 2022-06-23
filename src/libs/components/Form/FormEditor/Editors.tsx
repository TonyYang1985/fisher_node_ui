import classNames from 'classnames';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import { Calendar } from 'primereact/calendar';
import { Checkbox } from 'primereact/checkbox';
import { Dropdown } from 'primereact/dropdown';
import { InputNumber } from 'primereact/inputnumber';
import { InputSwitch } from 'primereact/inputswitch';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Password } from 'primereact/password';
import { RadioButton } from 'primereact/radiobutton';
import { Skeleton } from 'primereact/skeleton';
import { useEffect, useState } from 'react';
import { resolveValue } from '../../../utils/misc';
import { getTransaltedText } from '../FormViewer/DisplayerManager';
import { addWidgetFactory, EditorFactoryArgs, EditorWrapper, isInvalid } from './EditorsManager';

export const reservedUselessFnForEditors = () => {};

addWidgetFactory('display', (args: EditorFactoryArgs<any>) => {
  return (
    <EditorWrapper wfArgs={args} noValidate>
      <div className="p-inputtext">{`${args.valueObject[args.field]}`}</div>
    </EditorWrapper>
  );
});

addWidgetFactory('text', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { inputId, ...baseProps } = args.base;
  return (
    <EditorWrapper wfArgs={args}>
      <InputText id={inputId} {...baseProps} className={classNames({ 'p-invalid': isInvalid(args) }, className)} {...argsProps} />
    </EditorWrapper>
  );
});

addWidgetFactory('textarea', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { inputId, ...baseProps } = args.base;
  return (
    <EditorWrapper wfArgs={args}>
      <InputTextarea style={{ resize: 'vertical' }} id={inputId} {...baseProps} className={classNames({ 'p-invalid': isInvalid(args) }, className)} {...argsProps} />
    </EditorWrapper>
  );
});

addWidgetFactory('select', (args: EditorFactoryArgs<any>) => {
  const [opts, setOpts] = useState<{ label: string; value: string | number }[]>();
  const { options, className, ...props } = args.props;

  useEffect(() => {
    resolveValue(options).then((inOpt) => {
      setOpts(inOpt);
    });
  }, [options]);

  const { onChange, ...oprops } = args.base;

  if (opts) {
    return (
      <EditorWrapper wfArgs={args}>
        <Dropdown
          {...oprops}
          onChange={(e) => {
            onChange(e);
            if (props['onValueChange']) {
              props['onValueChange'](e);
            }
          }}
          className={classNames({ 'p-invalid': isInvalid(args) }, className)}
          options={opts.map((o) => ({ value: o.value, label: getTransaltedText(o.label, args.trans, args.transLabelPrefix) }))}
          {...props}
        />
      </EditorWrapper>
    );
  } else {
    return (
      <EditorWrapper wfArgs={args}>
        <Dropdown {...args.base} className={classNames({ 'p-invalid': isInvalid(args) }, className)} options={opts} dropdownIcon="pi pi-spin pi-spinner" {...props} />
      </EditorWrapper>
    );
  }
});

addWidgetFactory('number', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { onChange, ...baseProps } = args.base;
  return (
    <EditorWrapper wfArgs={args}>
      <InputNumber {...baseProps} onValueChange={onChange} className={classNames({ 'p-invalid': isInvalid(args) }, className)} {...argsProps} />
    </EditorWrapper>
  );
});

addWidgetFactory('password', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  return (
    <EditorWrapper wfArgs={args}>
      <Password {...args.base} className={classNames({ 'p-invalid': isInvalid(args) }, className)} toggleMask {...argsProps} />
    </EditorWrapper>
  );
});

addWidgetFactory('checkbox', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { value, inputId, ...baseProps } = args.base;
  return (
    <EditorWrapper wfArgs={args}>
      <div className="p-field-checkbox p-m-2">
        <Checkbox inputId={`${inputId}-1`} checked={value} {...baseProps} className={classNames({ 'p-invalid': isInvalid(args) }, className)} {...argsProps} />
        <label htmlFor={`${inputId}-1`} style={{ cursor: 'pointer' }}>
          {getTransaltedText(args.props.label, args.trans, args.transLabelPrefix)}
        </label>
      </div>
    </EditorWrapper>
  );
});

addWidgetFactory('radio', (args: EditorFactoryArgs<any>) => {
  const [opts, setOpts] = useState<{ label: string; value: string | number }[]>();
  const { options, className, ...props } = args.props;

  useEffect(() => {
    resolveValue(options).then((inOpt) => {
      setOpts(inOpt);
    });
  }, [options]);

  if (opts) {
    return (
      <EditorWrapper wfArgs={args}>
        <div className="p-d-flex p-flex-wrap p-inputtext">
          {opts.map((opt, i) => {
            const key = `ckg-${args.field}-${i}`;
            const shouldChecked = opt.value === args.valueObject[args.field];
            return (
              <div key={key} className="p-field-checkbox p-m-2">
                <RadioButton
                  inputId={`${args.base.inputId}-${key}`}
                  name={args.base.name}
                  value={opt.value}
                  onChange={args.base.onChange}
                  checked={shouldChecked}
                  className={classNames({ 'p-invalid': isInvalid(args) }, className)}
                  {...props}
                />
                <label htmlFor={`${args.base.inputId}-${key}`} style={{ cursor: 'pointer' }}>
                  {getTransaltedText(opt.label, args.trans, args.transLabelPrefix)}
                </label>
              </div>
            );
          })}
        </div>
      </EditorWrapper>
    );
  } else {
    return (
      <EditorWrapper wfArgs={args}>
        <div className="p-field-checkbox">
          <RadioButton disabled inputId={`${args.base.inputId}`} />
          <label htmlFor={`${args.base.inputId}`}>
            <Skeleton width="10rem" className="p-m-2" />
          </label>
        </div>
        <div className="p-field-checkbox">
          <RadioButton disabled inputId={`${args.base.inputId}`} />
          <label htmlFor={`${args.base.inputId}`}>
            <Skeleton width="10rem" className="p-m-2" />
          </label>
        </div>
      </EditorWrapper>
    );
  }
});

addWidgetFactory('checkboxes', (args: EditorFactoryArgs<any>) => {
  const [opts, setOpts] = useState<{ label: string; value: string | number }[]>();
  const { options, className, ...props } = args.props;

  useEffect(() => {
    resolveValue(options).then((inOpt) => {
      setOpts(inOpt);
    });
  }, [options]);

  if (opts) {
    return (
      <EditorWrapper wfArgs={args}>
        <div className="p-d-inline-flex p-flex-wrap p-inputtext">
          {opts.map((opt, i) => {
            const key = `ckg-${args.field}-${i}`;
            const shouldChecked = args.valueObject[args.field].indexOf(opt.value) !== -1;
            return (
              <div key={key} className="p-field-checkbox p-m-2">
                <Checkbox
                  inputId={`${args.base.inputId}-${key}`}
                  name={args.base.name}
                  value={opt.value}
                  onChange={args.base.onChange}
                  checked={shouldChecked}
                  className={classNames({ 'p-invalid': isInvalid(args) }, className)}
                  {...props}
                />
                <label htmlFor={`${args.base.inputId}-${key}`} style={{ cursor: 'pointer' }}>
                  {getTransaltedText(opt.label, args.trans, args.transLabelPrefix)}
                </label>
              </div>
            );
          })}
        </div>
      </EditorWrapper>
    );
  } else {
    return (
      <EditorWrapper wfArgs={args}>
        <div className="p-field-checkbox">
          <Checkbox disabled inputId={`${args.base.inputId}`} />
          <label htmlFor={`${args.base.inputId}`}>
            <Skeleton width="10rem" className="p-m-2" />
          </label>
        </div>
        <div className="p-field-checkbox">
          <Checkbox disabled inputId={`${args.base.inputId}`} />
          <label htmlFor={`${args.base.inputId}`}>
            <Skeleton width="10rem" className="p-m-2" />
          </label>
        </div>
      </EditorWrapper>
    );
  }
});

addWidgetFactory('switch', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { value, inputId, ...baseProps } = args.base;
  return (
    <EditorWrapper wfArgs={args}>
      <div className="p-field-checkbox p-m-2">
        <InputSwitch inputId={`${inputId}-1`} checked={value} {...baseProps} className={classNames({ 'p-invalid': isInvalid(args) }, className)} {...argsProps} />
        <label htmlFor={`${inputId}-1`} style={{ cursor: 'pointer' }}>
          {getTransaltedText(args.props.label, args.trans, args.transLabelPrefix)}
        </label>
      </div>
    </EditorWrapper>
  );
});

const monthNavigatorTemplate = (e: any) => {
  return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} style={{ lineHeight: 1 }} />;
};

const yearNavigatorTemplate = (e: any) => {
  return <Dropdown value={e.value} options={e.options} onChange={(event) => e.onChange(event.originalEvent, event.value)} className="p-ml-2" style={{ lineHeight: 1 }} />;
};

addWidgetFactory('datetime', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { value, ...baseProps } = args.base;
  let dateValue: any = value;
  if (typeof value === 'string') {
    dateValue = dayjs(value).toDate();
  }

  return (
    <EditorWrapper wfArgs={args}>
      <Calendar
        {...baseProps}
        value={dateValue}
        className={classNames({ 'p-invalid': isInvalid(args) }, className)}
        mask="99/99/9999 99:99"
        monthNavigator
        yearNavigator
        showButtonBar
        showTime
        baseZIndex={999996}
        monthNavigatorTemplate={monthNavigatorTemplate}
        yearNavigatorTemplate={yearNavigatorTemplate}
        yearRange="1950:2030"
        {...argsProps}
      />
    </EditorWrapper>
  );
});

addWidgetFactory('date', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { value, ...baseProps } = args.base;
  let dateValue: any = value;
  if (typeof value === 'string') {
    dateValue = dayjs(value).toDate();
  }

  return (
    <EditorWrapper wfArgs={args}>
      <Calendar
        {...baseProps}
        value={dateValue}
        className={classNames({ 'p-invalid': isInvalid(args) }, className)}
        mask="99/99/9999"
        monthNavigator
        yearNavigator
        showButtonBar
        baseZIndex={999996}
        monthNavigatorTemplate={monthNavigatorTemplate}
        yearNavigatorTemplate={yearNavigatorTemplate}
        yearRange="1950:2030"
        {...argsProps}
      />
    </EditorWrapper>
  );
});

addWidgetFactory('time', (args: EditorFactoryArgs<any>) => {
  const { className, ...argsProps } = args.props;
  const { locale } = useRouter();
  return (
    <EditorWrapper wfArgs={args}>
      <Calendar {...args.base} mask="99:99" baseZIndex={999990} className={classNames({ 'p-invalid': isInvalid(args) }, className)} locale={locale} timeOnly {...argsProps} />
    </EditorWrapper>
  );
});

addWidgetFactory('currency', (args: EditorFactoryArgs<any>) => {
  const { className, locale = 'en-SG', currency = 'SGD', ...argsProps } = args.props;
  const { onChange, ...baseProps } = args.base;
  return (
    <EditorWrapper wfArgs={args}>
      <InputNumber {...baseProps} onValueChange={onChange} className={classNames({ 'p-invalid': isInvalid(args) }, className)} mode="currency" currency={currency} locale={locale} {...argsProps} />
    </EditorWrapper>
  );
});
