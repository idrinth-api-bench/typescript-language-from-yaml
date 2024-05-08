import Config from './config.js';
import {
  existsSync, readFileSync,
} from 'fs';
import {
  parse,
} from 'yaml';
import loadKeys from './loadKeys.js';
import Logger from './logger.js';
import findYamlFiles from './find-yaml-files.js';

// eslint-disable-next-line complexity
export default (folder: string, logger: Logger,) => {
  let errors = 0;
  let warnings = 0;
  const localConfig = new Config(`${ folder }`,);
  const input = `${ folder }/${ localConfig.originDirectory }`;
  if (! existsSync(input,)) {
    logger.error(`folder ${ input } doesn't exist`,);
    errors ++;
    return {
      errors,
      warnings,
    };
  }
  logger.info(
    `Checking translations in folder ${ input }`,
  );
  logger.info('',);
  const yamlFiles = findYamlFiles(folder, localConfig,);
  const keys = {
    en: [],
  };
  yamlFiles.forEach((yamlFile,) => {
    keys[yamlFile.language] = [];

    const content = readFileSync(yamlFile.input, 'utf8',);

    try {
      const data = parse(content,);
      keys[yamlFile.language] = loadKeys(data,);
    } catch (e) {
      logger.error(`Failed parsing ${ yamlFile.input }: ${ e }`,);
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
  return {
    errors,
    warnings,
  };
};
