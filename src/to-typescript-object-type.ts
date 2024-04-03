import toTypescriptObject from './to-typescript-object.js';

export default (data: object,) => toTypescriptObject(data,)
  .replace(/: '.*?',\n/ug, ': string,\n',);
