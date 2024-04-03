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
  ORIGIN_DIRECTORY,
} from './constants.js';
import Logger from './logger.js';
import loadKeys from './loadKeys.js';
export default (logger: Logger, folder: string,) => {
  if (! existsSync(`${ folder }/${ ORIGIN_DIRECTORY }`,)) {
    logger.error(`folder ${ folder }/${ ORIGIN_DIRECTORY } doesn't exist`,);
    return false;
  }
  logger.info(
    `Checking translations in folder ${ folder }/${ ORIGIN_DIRECTORY }`,
  );
  logger.info('',);
  const yamlFiles = readdirSync(`${ folder }/${ ORIGIN_DIRECTORY }`,)
    .filter((file,) => file.endsWith('.yml',),);
  const keys = {
    en: [],
  };
  let errors = 0;
  yamlFiles.forEach((yamlFile,) => {
    const lang = yamlFile.replace('.yml', '',);
    keys[lang] = [];
    const yamlPath = `${ folder }/${ ORIGIN_DIRECTORY }/${ yamlFile }`;

    const content = readFileSync(yamlPath, 'utf8',);

    try {
      const data = parse(content,);
      keys[lang] = loadKeys(data,);
    } catch (e) {
      logger.error(`Failed parsing ${ yamlPath }: ${ e }`,);
      errors ++;
    }
  },);
  let warnings = 0;
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
  return errors === EMPTY;
};
