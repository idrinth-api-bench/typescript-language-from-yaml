import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'fs';
import {
  parse,
} from 'yaml';
import Logger from './logger.js';
import toTypescriptObject from './to-typescript-object.js';
import loadKeys from './loadKeys.js';
import Config from './config.js';
import toTypescriptObjectType from './to-typescript-object-type.js';
import shouldSplit from './should-split.js';
import buildTranslationFile from './build-translation-file.js';
import findYamlFiles from './find-yaml-files.js';

// eslint-disable-next-line complexity
export default (
  logger: Logger,
  config: Config,
) => {
  for (const folder of config.folders) {
    const localConfig = new Config(`${ folder }`, config.overwrites,);
    if (existsSync(`${ folder }/${ localConfig.targetDirectory }`,)) {
      for (const file of readdirSync(
        `${ folder }/${ localConfig.targetDirectory }`,
        'utf8',
      )) {
        unlinkSync(`${ folder }/${ localConfig.targetDirectory }/${ file }`,);
      }
    }
    const yamlFiles = findYamlFiles(folder, localConfig,);
    const def = localConfig.shouldInjectDefaultLanguage
      ? parse(readFileSync(
        `${ folder }/${ localConfig.originDirectory }/en.yml`,
        'utf8',
      ),)
      : {};
    const files = [];
    const out = `${ folder }/${ localConfig.targetDirectory }`;
    if (! existsSync(out,)) {
      mkdirSync(out, {
        recursive: true,
      },);
    }
    // eslint-disable-next-line complexity
    yamlFiles.forEach((yamlFile,) => {
      const content = readFileSync(yamlFile.input, 'utf8',);
      const data = parse(content,);
      if (shouldSplit(localConfig, data,)) {
        for (const key of Object.keys(data,)) {
          writeFileSync(
            `${ out }/${ yamlFile.language }-${ key }.ts`,
            buildTranslationFile(localConfig, data[key], def[key],),
            'utf8',
          );
          files.push(`${ yamlFile.language }-${ key }`,);
          if (yamlFile.language === 'en' && localConfig.isStrictTypes) {
            writeFileSync(
              `${ out }/type-${ key }.ts`,
              localConfig.isVerbatimModuleSyntax
                ? `/* eslint max-len:0 */\ntype ln = ${ toTypescriptObjectType(data[key],) };\n\nexport type lang = ln;\n`
                : `/* eslint max-len:0 */\ntype lang = ${ toTypescriptObjectType(data[key],) };\n\nexport default lang;\n`,
              'utf8',
            );
          }
        }
      } else {
        writeFileSync(
          `${ out }/${ yamlFile.language }.ts`,
          buildTranslationFile(localConfig, data, def,),
          'utf8',
        );
        files.push(`${ yamlFile.language }`,);
        if (yamlFile.language === 'en' && localConfig.isStrictTypes) {
          writeFileSync(
            `${ out }/type.ts`,
            localConfig.isVerbatimModuleSyntax
              ? `/* eslint max-len:0 */\ntype ln = ${ toTypescriptObjectType(data,) };\n\nexport type lang = ln;\n`
              : `/* eslint max-len:0 */\ntype lang = ${ toTypescriptObjectType(data,) };\n\nexport default lang;\n`,
            'utf8',
          );
        }
      }
      if (yamlFile.language === 'en') {
        const keys = loadKeys(data,);
        writeFileSync(
          `${ out }/language-key.ts`,
          localConfig.isVerbatimModuleSyntax
            ? `/* eslint max-len:0 */\ntype lk = '${ keys.join('\'|\'',) }';\nexport type languageKey = lk;\n`
            : `/* eslint max-len:0 */\ntype languageKey = '${ keys.join('\'|\'',) }';\nexport default languageKey;\n`,
          'utf8',
        );
      }
    },);
    const languages = toTypescriptObject(
      yamlFiles
        .map((k,) => k.language,),
    );
    writeFileSync(
      `${ out }/languages.ts`,
      `/* eslint max-len:0 */\nconst languages = ${ languages };\nexport default languages;\n`,
      'utf8',
    );
    writeFileSync(
      `${ out }/files.ts`,
      `const files = ${ toTypescriptObject(files,) };\nexport default files;\n`,
      'utf8',
    );
    if (! localConfig.hasNoTranslationsFile) {
      let fileImporter = '';
      let fileExporter = 'const translations = {';
      for (const f of files) {
        const v = f.replace(/-/gu, '_',);
        fileImporter += `import ${ v } from './${ f }.js';\n`;
        fileExporter += `\n  '${ f }': ${ v },`;
      }
      fileExporter += '\n};';
      writeFileSync(
        `${ out }/translations.ts`,
        `${ fileImporter }${ fileExporter }\nexport default translations;\n`,
        'utf8',
      );
    }
  }
};
