import {
  DEFAULT_INDENTATION,
} from './constants.js';

export default (data: object,): string => {
  return JSON.stringify(data, undefined, DEFAULT_INDENTATION,)
    .replace(/'/ug, '\\\\\'',)
    .replace(/"([a-z][^"-]+?)":/ug, '$1:',)
    .replace(/"([^"]+?)":/ug, '\'$1\':',)
    .replace(/\n/ug, ',\n',)
    .replace(/"([^"]+?)",/ug, '\'$1\',',)
    .replace(/,,/ug, ',',)
    .replace(/\{,/ug, '{',)
    .replace(/\\\\'/ug, '\\\'',)
    .replace(/\\'(.*?)\\':/ug, '\'$1\':',)
    .replace(/: "(.+?)",/ug, ': \'$1\',',)
    .replace(/\[,/ug, '[',);
}
