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

export default (
  logger: Logger,
  config: Config,
) => {
  for (const folder of config.folders) {
    const localConfig = new Config(`${ folder }`,);
    if (existsSync(`${ folder }/${ localConfig.targetDirectory }`,)) {
      for (const file of readdirSync(`${ folder }/${ localConfig.targetDirectory }`, 'utf8',)) {
        unlinkSync(`${ folder }/${ localConfig.targetDirectory }/${ file }`,);
      }
    }
    const yamlFiles = readdirSync(`${ folder }/${ localConfig.originDirectory }`, 'utf8',)
      .filter((file,) => file.endsWith('.yml',),);

    const files = [];
    // eslint-disable-next-line complexity
    yamlFiles.forEach((yamlFile,) => {
      const lang = yamlFile.replace('.yml', '',);
      const yamlPath = `${ folder }/${ localConfig.originDirectory }/${ yamlFile }`;

      if (! existsSync(`${ folder }/${ localConfig.targetDirectory }`,)) {
        mkdirSync(`${ folder }/${ localConfig.targetDirectory }`, {
          recursive: true,
        },);
      }

      const content = readFileSync(yamlPath, 'utf8',);
      const data = parse(content,);
      const typeName = localConfig.isStrictTypes ? 'langType' : 'Partial<langType>';
      if (localConfig.isSplit && typeof data[Object.keys(data,).pop()] !== 'string') {
        for (const key of Object.keys(data,)) {
          writeFileSync(
            `${ folder }/${ localConfig.targetDirectory }/${ lang }-${ key }.ts`,
            localConfig.isVerbatimModuleSyntax
              ? `/* eslint max-len:0 */\nimport {\n  lang as langType,\n} from './type-${ key }.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data[key],) };\n\nexport default lang;\n`
              : `/* eslint max-len:0 */\nimport langType from './type-${ key }.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data[key],) };\n\nexport default lang;\n`,
            'utf8',
          );
          files.push(`${ lang }-${ key }`,);
          if (lang === 'en') {
            writeFileSync(
              `${ folder }/${ localConfig.targetDirectory }/type-${ key }.ts`,
              localConfig.isVerbatimModuleSyntax
                ? `/* eslint max-len:0 */\ntype ln = ${ toTypescriptObject(data[key],).replace(/: '.*?',/ug, ': string,',) };\n\nexport type lang = ln;\n`
                : `/* eslint max-len:0 */\ntype lang = ${ toTypescriptObject(data[key],).replace(/: '.*?',/ug, ': string,',) };\n\nexport default lang;\n`,
              'utf8',
            );
          }
        }
      } else {
        writeFileSync(
          `${ folder }/${ localConfig.targetDirectory }/${ lang }.ts`,
          localConfig.isVerbatimModuleSyntax
            ? `/* eslint max-len:0 */\nimport {\n  lang as langType,\n} from './type.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data,) };\n\nexport default lang;\n`
            : `/* eslint max-len:0 */\nimport langType from './type.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data,) };\n\nexport default lang;\n`,
          'utf8',
        );
        files.push(`${ lang }`,);
        if (lang === 'en') {
          writeFileSync(
            `${ folder }/${ localConfig.targetDirectory }/type.ts`,
            localConfig.isVerbatimModuleSyntax
              ? `/* eslint max-len:0 */\ntype ln = ${ toTypescriptObject(data,).replace(/: '.*?',/ug, ': string,',) };\n\nexport type lang = ln;\n`
              : `/* eslint max-len:0 */\ntype lang = ${ toTypescriptObject(data,).replace(/: '.*?',/ug, ': string,',) };\n\nexport default lang;\n`,
            'utf8',
          );
        }
      }
      if (lang === 'en') {
        const keys = loadKeys(data,);
        writeFileSync(
          `${ folder }/${ localConfig.targetDirectory }/language-key.ts`,
          localConfig.isVerbatimModuleSyntax
            ? `/* eslint max-len:0 */\ntype lk = '${ keys.join('\'|\'',) }';\nexport type languageKey = lk;\n`
            : `/* eslint max-len:0 */\ntype languageKey = '${ keys.join('\'|\'',) }';\nexport default languageKey;\n`,
          'utf8',
        );
      }
    },);
    const languages = toTypescriptObject(
      yamlFiles
        .map((k,) => k.replace(/\.yml$/u, '',),),
    );
    writeFileSync(
      `${ folder }/${ localConfig.targetDirectory }/languages.ts`,
      `/* eslint max-len:0 */\nconst languages = ${ languages };\nexport default languages;\n`,
      'utf8',
    );
    writeFileSync(
      `${ folder }/${ localConfig.targetDirectory }/files.ts`,
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
        `${ folder }/${ localConfig.targetDirectory }/translations.ts`,
        `${ fileImporter }${ fileExporter }\nexport default translations;\n`,
        'utf8',
      );
    }
  }
};
