import Config from './config.js';

export default (config: Config, data: object,) => {
  if (! config.isSplit) {
    return false;
  }
  for (const key of Object.keys(data,)) {
    if (typeof data[key] === 'string') {
      return false;
    }
  }
  return true;
};
