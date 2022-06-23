export type FormErrorFieldMessage = Record<string, [string, Record<string, any> | undefined][]> | undefined;
export type FormErrorFormMessage = Array<string>;
export class FormError extends Error {
  fieldMessages: FormErrorFieldMessage = {};

  formMessages: FormErrorFormMessage = [];
}
