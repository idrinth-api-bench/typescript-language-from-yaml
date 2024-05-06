import {
  EMPTY,
} from './constants.js';
import Logger from './logger.js';
import Config from './config.js';
import checkFolder from './check-folder.js';
export default (
  logger: Logger,
  config: Config,
) => {
  let errors = 0;
  let warnings = 0;
  for (const folder of config.folders) {
    const partial = checkFolder(folder, logger,);
    errors += partial.errors;
    warnings += partial.warnings;
  }
  return errors === EMPTY && (! config.isFailOnWarning || warnings === EMPTY);
};
