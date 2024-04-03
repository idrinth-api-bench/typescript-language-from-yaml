import Logger from "./logger.js";
import Config from "./config.js";
import {writeFileSync} from "fs";
import {stringify} from "yaml";

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
    const target = `${folder}/.idrinth-typescript-language-from-yaml.yml`;
    writeFileSync(
      target,
      stringify(toWrite),
      'utf8',
    );
    logger.info(`Wrote  ${ target }`);
  }
};
