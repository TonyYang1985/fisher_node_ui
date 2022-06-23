import printValue from 'yup/lib/util/printValue';
export const zh = {
  mixed: {
    default: '该字段无效',
    required: '该字段是必填字段',
    oneOf: '该字段必须是以下值之一：${values}',
    notOneOf: '该字段不得是以下值之一：${values}',
    defined: '该字段必须定义',
    notType: ({ path, type, value, originalValue }) => {
      const isCast = originalValue != null && originalValue !== value;
      let msg = `${path} 必须是 \`${type}\` 类型，` + `但是输入的值为：\`${printValue(value, true)}\`` + (isCast ? ` (cast from the value \`${printValue(originalValue, true)}\`).` : '.');

      if (value === null) {
        msg += `\n If "null" is intended as an empty value be sure to mark the schema as \`.nullable()\``;
      }

      return msg;
    },
  },
  string: {
    length: '该字段必须是${length}个字符',
    min: '该字段必须至少是${min}字符',
    max: '该字段必须最多${max}字符',
    matches: '该字段必须匹配以下内容：“${regex}”',
    email: '该字段必须是有效的电子邮件',
    url: '该字段必须是有效的URL',
    uuid: '该字段必须是有效的uuid',
    trim: '该字段必须是修剪的字符串',
    lowercase: '该字段必须是小写字符串',
    uppercase: '该字段必须是大写字符串',
  },
  number: {
    min: '该字段必须大于或等于${min}',
    max: '该字段必须小于或等于${max}',
    lessThan: '该字段必须小于${less}',
    moreThan: '该字段必须大于${more}',
    positive: '该字段必须是正数',
    negative: '该字段必须是负数',
    integer: '该字段必须是整数',
  },
  date: {
    min: '该字段必须晚于${min}',
    max: '该字段必须早于${max}',
  },
  boolean: {
    isValue: ({ path, type, value, originalValue }) => {
      return value == 'true' ? '必须选择' : '不可以选择';
    },
  },
  object: {
    noUnknown: '该字段具有未指定的键：${unknown}',
  },
  array: {
    min: '该字段必须至少具有${min}项目',
    max: '该字段必须具有小于或等于${max}项目',
    length: '该字段必须具有${length}项目',
  },
};
