import Config from './config.js';

export default (config: Config, data: object, def: object,): object => {
  if (! config.isSimplifiedHashMap) {
    return data;
  }
  const simplified = {};
  const simplify = (prefix: string, obj: object,) => {
    for (const key of Object.keys(obj,)) {
      if (typeof obj[key] === 'string') {
        simplified[prefix + key] = obj[key];
      } else if (typeof obj[key] === 'object') {
        simplify(prefix + key + '.', obj[key],);
      }
    }
  };
  if (config.shouldInjectDefaultLanguage) {
    simplify('', def,);
  }
  simplify('', data,);
  return simplified;
};
