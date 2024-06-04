import toTypescriptObject from './to-typescript-object.js';
import Config from './config.js';
import simplifyObject from './simplify-object.js';

export default (config: Config, data: object, def: object,) => {
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
  const tsObj = toTypescriptObject(simplifyObject(config, data, def,),);
  return `/* eslint max-len:0 */\n${ head }${ tsObj };\n\nexport default lang;\n`;
};
