import {
  readdirSync,
  statSync,
} from 'fs';
import {
  WAIT_DURATION,
} from './constants.js';
import delay from './delay.js';
import generate from './generate.js';
import Logger from './logger.js';
import Config from './config.js';

// eslint-disable-next-line complexity
export default async(
  logger: Logger,
  config: Config,
) => {
  let last = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const now = Date.now();
    for (const folder of config.folders) {
      const localConfig = new Config(folder,);
      let modified = false;
      for (const file of readdirSync(
        `${ folder }/${ localConfig.originDirectory }`,
        'utf8',
      )) {
        if (file.endsWith('.yml',)) {
          const stats = statSync(
            `${ folder }/${ localConfig.originDirectory }/${ file }`,
          );
          // eslint-disable-next-line max-depth
          if (stats.mtimeMs < now && stats.mtimeMs >= last) {
            modified = true;
            break;
          }
        }
      }
      if (modified) {
        generate(
          logger,
          localConfig,
        );
      }
    }
    last = now;
    // eslint-disable-next-line no-await-in-loop
    await delay(WAIT_DURATION,);
  }
};
