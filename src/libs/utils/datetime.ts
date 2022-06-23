import dayjs, { extend, locale } from 'dayjs';
import 'dayjs/locale/zh-cn';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import tz from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import _ from 'lodash';
extend(utc);
extend(tz);
extend(localizedFormat);
extend(relativeTime);

export const DATE_FORMAT = 'DD/MM/YYYY';
export const DATE_TIME_FORMAT = 'DD/MM/YYYY HH:mm';
export const TIME_FORMAT = 'HH:mm';

const changeLocale = (lang: string) => {
  if (lang === 'zh') {
    locale('zh-cn');
  } else {
    locale('en');
  }
};

const guessTimezone = () => dayjs.tz.guess();

const parseDate = (date: string) => {
  if (_.isEmpty(date)) {
    return new Date();
  }
  return dayjs(date, DATE_FORMAT).toDate();
};

const toLocalDateString = (date: Date | string) => {
  if (_.isEmpty(date)) {
    return '';
  }
  return dayjs(date).format(DATE_FORMAT);
};

const parseDatetime = (dateTime: string) => {
  if (_.isEmpty(dateTime)) {
    return new Date();
  }
  return dayjs(dateTime, DATE_TIME_FORMAT).toDate();
};

const toLocalDatetimeString = (dateTime: Date | string) => {
  if (_.isEmpty(dateTime)) {
    return '';
  }
  return dayjs(dateTime).format(DATE_TIME_FORMAT);
};

const parseWithTimezone = (dateTime: string, tz: string) => {
  if (_.isEmpty(dateTime)) {
    return new Date();
  }
  return dayjs.tz(dateTime, tz).toDate();
};

const localDateTimeShort = (date: string | number | dayjs.Dayjs | Date | undefined, timezone = guessTimezone()) => {
  if (_.isEmpty(date)) {
    return '';
  }
  return dayjs(date).tz(timezone).format(DATE_TIME_FORMAT);
};

const localizedDatatime = (date: string | number | dayjs.Dayjs | Date | undefined, timezone = guessTimezone()) => {
  if (_.isEmpty(date)) {
    return '';
  }
  return dayjs(date).tz(timezone).format('lll');
};

const localizedData = (date: string | number | dayjs.Dayjs | Date | undefined, timezone = guessTimezone()) => {
  if (_.isEmpty(date)) {
    return '';
  }
  return dayjs(date).tz(timezone).format(DATE_FORMAT);
};

const localizedDatatimeFromNow = (date: string | number | dayjs.Dayjs | Date | undefined, timezone = guessTimezone()) => {
  if (_.isEmpty(date)) {
    return '';
  }
  return dayjs(date).tz(timezone).fromNow();
};

export const datetime = {
  guessTimezone,
  parseDate,
  toLocalDateString,
  parseDatetime,
  toLocalDatetimeString,
  parseWithTimezone,
  localDateTimeShort,
  localizedDatatime,
  localizedDatatimeFromNow,
  localizedData,
  changeLocale,
};
