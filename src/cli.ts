import {
  EXIT_FAILURE,
  EXIT_SUCCESS,
  FIRST_ARGUMENT,
  SECOND_ARGUMENT,
} from './constants.js';
import watch from './watch.js';
import generate from './generate.js';
import check from './check.js';
import Logger from './logger.js';

// eslint-disable-next-line complexity
export default async(args: string[], cwd: string,): Promise<number> => {
  const logger = new Logger();
  switch (args[FIRST_ARGUMENT]) {
    case 'check':
      return check(
        logger,
        args[SECOND_ARGUMENT] || cwd,
      ) ? EXIT_SUCCESS : EXIT_FAILURE;
    case 'generate':
      generate(
        logger,
        cwd,
        args.includes('--split',),
        args.includes('--verbatim-module-syntax',),
        args.includes('--no-translations-file',),
        args.includes('--strict-types',),
      );
      return EXIT_SUCCESS;
    case 'watch':
      await watch(
        logger,
        cwd,
        args
          .splice(SECOND_ARGUMENT,)
          .map((arg,) => arg.split('=',),),
      );
      return EXIT_SUCCESS;
    default:
      logger.info(
        'itlfy check - checks the current working directory\'s yaml files.',
      );
      logger.info(
        'itlfy watch [...folder] - watches and rebuilds ' +
        'the watched folder\'s language files on change.',
      );
      logger.info(
        'itlfy generate - generates typescript files from ' +
        'the current working directory\'s yaml files.',
      );
      return EXIT_SUCCESS;
  }
};
