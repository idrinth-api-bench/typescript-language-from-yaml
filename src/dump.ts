import Logger from './logger.js';
import Config from './config.js';
import {
  readFileSync,
  writeFileSync,
} from 'fs';

export default (
  logger: Logger,
  config: Config,
) => {
  for (const folder of config.folders) {
    const data = readFileSync(
      `${ folder }/${ config.originDirectory }/en.yml`,
      'utf8',
    ).replace(/ *[a-z_0-9]+:/ug, '',);
    writeFileSync(`${ folder }/dump.txt`, data, 'utf8',);
  }
};
