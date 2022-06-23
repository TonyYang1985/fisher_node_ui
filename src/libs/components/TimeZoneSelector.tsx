import { Dropdown, DropdownProps } from 'primereact/dropdown';
import { TIMEZONES } from '../utils/timezones';

const timezoneOptions = Object.keys(TIMEZONES).map((tz) => ({ label: tz, value: TIMEZONES[tz] }));

export type TimeZoneSelectorProps = DropdownProps;

export const TimeZoneSelector = (props: TimeZoneSelectorProps) => {
  return <Dropdown options={timezoneOptions} filter filterBy="label" {...props} />;
};
