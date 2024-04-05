import {
  EXIT_FAILURE,
  EXIT_SUCCESS,
  FIRST_ARGUMENT,
} from './constants.js';
import watch from './watch.js';
import generate from './generate.js';
import check from './check.js';
import Logger from './logger.js';
import Config from './config.js';
import init from './init.js';
import dump from './dump.js';

// eslint-disable-next-line complexity
export default async(args: string[], cwd: string,): Promise<number> => {
  const logger = new Logger();
  const config = new Config(cwd, args,);
  switch (args[FIRST_ARGUMENT]) {
    case 'check':
      return check(
        logger,
        config,
      ) ? EXIT_SUCCESS : EXIT_FAILURE;
    case 'generate':
      generate(
        logger,
        config,
      );
      return EXIT_SUCCESS;
    case 'dump':
      dump(
        logger,
        config,
      );
      return EXIT_SUCCESS;
    case 'init':
      init(
        logger,
        config,
      );
      return EXIT_SUCCESS;
    case 'watch':
      await watch(
        logger,
        config,
      );
      return EXIT_SUCCESS;
    default:
      logger.info(
        'itlfy check [...folder] - checks the watched folders\' yaml files.',
      );
      logger.info(
        'itlfy watch [...folder] - watches and rebuilds ' +
        'the watched folders\' language files on change.',
      );
      logger.info(
        'itlfy generate [...folder] - generates typescript files from ' +
        'the watched folders\' files.',
      );
      logger.info(
        'itlfy init [...folder] - generates config files for the given' +
        'directories.',
      );
      return EXIT_SUCCESS;
  }
};
