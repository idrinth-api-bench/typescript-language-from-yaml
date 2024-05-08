import toTypescriptObject from './to-typescript-object.js';
import Config from './config.js';

export default (config: Config, data: object,) => {
  const head = (() => {
    if (! config.isStrictTypes) {
      return 'const lang = ';
    }
    if (! config.isVerbatimModuleSyntax) {
      return 'import langType from \'./type.js\';\nconst lang: langType = ';
    }
    return 'import {\n  lang as langType,\n} from \'./type.js\';' +
      '\nconst lang: langType = ';
  })();
  return `/* eslint max-len:0 */\n${ head }${ toTypescriptObject(data,) };\n\nexport default lang;\n`;
};
