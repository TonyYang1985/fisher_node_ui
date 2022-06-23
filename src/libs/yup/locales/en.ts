import printValue from 'yup/lib/util/printValue';
export const en = {
  mixed: {
    default: 'The field is invalid',
    required: 'The field is a required field',
    oneOf: 'The field must be one of the following values: ${values}',
    notOneOf: 'The field must not be one of the following values: ${values}',
    defined: 'The field must be defined',
    notType: ({ path, type, value, originalValue }) => {
      const isCast = originalValue != null && originalValue !== value;
      let msg = `${path} must be a \`${type}\` type, ` + `but the final value was: \`${printValue(value, true)}\`` + (isCast ? ` (cast from the value \`${printValue(originalValue, true)}\`).` : '.');

      if (value === null) {
        msg += `\n If "null" is intended as an empty value be sure to mark the schema as \`.nullable()\``;
      }

      return msg;
    },
  },
  string: {
    length: 'The field must be exactly ${length} characters',
    min: 'The field must be at least ${min} characters',
    max: 'The field must be at most ${max} characters',
    matches: 'The field must match the following: "${regex}"',
    email: 'The field must be a valid email',
    url: 'The field must be a valid URL',
    uuid: 'The field must be a valid UUID',
    trim: 'The field must be a trimmed string',
    lowercase: 'The field must be a lowercase string',
    uppercase: 'The field must be a upper case string',
  },
  number: {
    min: 'The field must be greater than or equal to ${min}',
    max: 'The field must be less than or equal to ${max}',
    lessThan: 'The field must be less than ${less}',
    moreThan: 'The field must be greater than ${more}',
    positive: 'The field must be a positive number',
    negative: 'The field must be a negative number',
    integer: 'The field must be an integer',
  },
  date: {
    min: 'The field must be later than ${min}',
    max: 'The field must be at earlier than ${max}',
  },
  boolean: {
    isValue: ({ path, type, value, originalValue }) => {
      return value == 'true' ? 'Must be selected' : 'Must NOT be selected';
    },
  },
  object: {
    noUnknown: 'The field has unspecified keys: ${unknown}',
  },
  array: {
    min: 'The field must have at least ${min} items',
    max: 'The field must have less than or equal to ${max} items',
    length: 'The field must be have ${length} items',
  },
};
