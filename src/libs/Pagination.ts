import _ from 'lodash';

export type PaginationOut<T> = {
  data: T[];

  totalRecords: number;

  pageCount: number;
};

export type PaginationIn<T = Record<string, string | number>> = {
  pageIndex?: number;

  recordIndex?: number;

  pageSize?: number;

  search?: string;

  sort?: string;
} & T;

export const getSortField = (column: string | undefined) => {
  if (column) {
    return column.startsWith('!') ? column.substr(1) : column;
  }
};

export const getSort = (column: string | undefined, order: -1 | 0 | 1 | undefined | null) => {
  if (column === undefined || order === 0 || order === undefined || order === null) {
    return {};
  }
  return { sort: sorting(column, order) };
};

export const sorting = (column: string, sorting: 'ASC' | 'DESC' | 1 | 0 | -1) => {
  return sorting === 'ASC' || sorting > 0 ? column : `!${column}`;
};

export const isAsc = (sorting: string | undefined) => {
  return !isDesc(sorting);
};

export const isDesc = (sorting: string | undefined) => {
  if (sorting) {
    return sorting.startsWith('!');
  }
};

export type Query<T = Record<string, string | number>> = {
  num: <K = number | undefined | Promise<boolean>>(key: keyof T, value?: number) => K;
  str: <K = string | undefined | Promise<boolean>>(key: keyof T, value?: string) => K;
  keys: () => string[];
  values: () => string[];
  raw: () => Partial<T>;
  set: (val: T) => Promise<boolean>;
};

export type NextRouterLike = {
  query: any;
  push: (url: { query: any }, ...args) => Promise<boolean>;
};

export function parseQuery<T>({ query, push }: NextRouterLike, defaultValue?: Partial<T>): Query<T> {
  const parsedQuery: Partial<T> = defaultValue ?? {};
  if (query) {
    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (!Array.isArray(value)) {
        parsedQuery[key] = `${value ?? ''}`;
      } else {
        parsedQuery[key] = value!.join(',');
      }
    });
  }

  const result: Query<T> = {
    num: ((key: keyof T, value?: number) => {
      if (!_.isNil(value)) {
        if (!_.isEqual(parsedQuery[key], value)) {
          return push({ query: Object.assign({}, parsedQuery, { [key]: `${value}` }) });
        }
      } else if (parsedQuery[key]) {
        return _.toNumber(parsedQuery[key]);
      }
    }) as any,
    str: ((key: keyof T, value?: string) => {
      if (!_.isNil(value)) {
        if (!_.isEqual(parsedQuery[key], value)) {
          return push({ query: Object.assign({}, parsedQuery, { [key]: value }) });
        }
      } else {
        return parsedQuery[key] ? `${parsedQuery[key]}` : undefined;
      }
    }) as any,
    keys: () => Object.keys(parsedQuery),
    values: () => Object.values(parsedQuery),
    raw: () => parsedQuery,
    set: (val: T) => {
      return push({ query: val as any });
    },
  };

  return result;
}
