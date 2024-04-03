import {
  existsSync,
  readdirSync,
  readFileSync,
} from 'fs';
import {
  parse,
} from 'yaml';
import {
  EMPTY,
} from './constants.js';
import Logger from './logger.js';
import loadKeys from './loadKeys.js';
import Config from "./config.js";
export default (
  logger: Logger,
  config: Config,
) => {
  let errors = 0;
  let warnings = 0;
  for  (const  folder of config.folders) {
    const localConfig = new Config(`${ folder }`);
    if (! existsSync(`${ folder }/${ localConfig.originDirectory }`,)) {
      logger.error(`folder ${ folder }/${ localConfig.originDirectory } doesn't exist`,);
      errors ++;
      continue;
    }
    logger.info(
      `Checking translations in folder ${ folder }/${ localConfig.originDirectory }`,
    );
    logger.info('',);
    const yamlFiles = readdirSync(`${ folder }/${ localConfig.originDirectory }`,)
      .filter((file,) => file.endsWith('.yml',),);
    const keys = {
      en: [],
    };
    yamlFiles.forEach((yamlFile,) => {
      const lang = yamlFile.replace('.yml', '',);
      keys[lang] = [];
      const yamlPath = `${ folder }/${ localConfig.originDirectory }/${ yamlFile }`;

      const content = readFileSync(yamlPath, 'utf8',);

      try {
        const data = parse(content,);
        keys[lang] = loadKeys(data,);
      } catch (e) {
        logger.error(`Failed parsing ${ yamlPath }: ${ e }`,);
        errors ++;
      }
    },);
    for (const lang of Object.keys(keys,)) {
      if (lang !== 'en') {
        const tooMany = keys[lang].filter((key,) => ! keys.en.includes(key,),);
        const missing = keys.en.filter((key,) => ! keys[lang].includes(key,),);
        for (const key of tooMany) {
          errors ++;
          logger.error(
            `ERROR: ${ lang } defines ${ key }, that doesn't exist in english.`,
          );
        }
        for (const key of missing) {
          warnings ++;
          logger.warn(
            `WARN: ${ lang } lacks ${ key }, that is defined in english.`,
          );
        }
      }
    }
    logger.info('',);
    logger.info(`Found ${ errors } errors and ${ warnings } warnings.`,);
    logger.info('',);
  }
  return errors === EMPTY && (! config.isFailOnWarning || warnings === EMPTY);
};
