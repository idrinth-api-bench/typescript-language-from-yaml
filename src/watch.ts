import {
  readdirSync,
  statSync,
} from 'fs';
import {
  EMPTY,
  ORIGIN_DIRECTORY,
  WAIT_DURATION,
} from './constants.js';
import delay from './delay.js';
import generate from './generate.js';
import Logger from './logger.js';

export default async(logger: Logger, cwd: string, folders: string[][],) => {
  if (folders.length === EMPTY) {
    folders.push([
      cwd,
      'false',
      'false',
    ],);
  }
  let last = Date.now();
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const now = Date.now();
    for (const data of folders) {
      const [
        folder,
        split,
        verbatim
      ] = data;
      let modified = false;
      for (const file of readdirSync(`${ cwd }/${ folder }/${ ORIGIN_DIRECTORY }`, 'utf8',)) {
        if (file.endsWith('.yml',)) {
          const stats = statSync(`${ cwd }/${ folder }/${ ORIGIN_DIRECTORY }/${ file }`,);
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
          `${ cwd }/${ folder }`,
          split === 'true',
          verbatim === 'true',
        );
      }
    }
    last = now;
    // eslint-disable-next-line no-await-in-loop
    await delay(WAIT_DURATION,);
  }
};
