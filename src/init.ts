import Logger from './logger.js';
import Config from './config.js';
import {
  writeFileSync,
} from 'fs';
import {
  stringify,
} from 'yaml';
import {
  CONFIG_FILE,
} from './constants.js';

export default (
  logger: Logger,
  config: Config,
) => {
  const toWrite = {
    originDirectory: config.originDirectory,
    targetDirectory: config.targetDirectory,
    hasNoTranslationsFile: config.hasNoTranslationsFile,
    isVerbatimModuleSyntax: config.isVerbatimModuleSyntax,
    isSplit: config.isSplit,
    isStrictTypes: config.isStrictTypes,
    isFailOnWarning: config.isFailOnWarning,
  };
  for (const folder of config.folders) {
    const target = `${ folder }/${ CONFIG_FILE }`;
    writeFileSync(
      target,
      stringify(toWrite,),
      'utf8',
    );
    logger.info(`Wrote  ${ target }`,);
  }
};
