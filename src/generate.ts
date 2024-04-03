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
import {
  ORIGIN_DIRECTORY,
  TARGET_DIR,
} from './constants.js';
import Logger from './logger.js';
import toTypescriptObject from './to-typescript-object.js';
import loadKeys from './loadKeys.js';

export default (
  logger: Logger, cwd: string,
  shouldSplit = false,
  isVerbatimModuleSyntax = false,
  isWithoutTranslationFile = false,
  isStrictTyping = false,
  // eslint-disable-next-line max-params
) => {
  if (existsSync(`${ cwd }/${ TARGET_DIR }`,)) {
    for (const file of readdirSync(`${ cwd }/${ TARGET_DIR }`, 'utf8',)) {
      unlinkSync(`${ cwd }/${ TARGET_DIR }/${ file }`,);
    }
  }
  const yamlFiles = readdirSync(`${ cwd }/${ ORIGIN_DIRECTORY }`, 'utf8',)
    .filter((file,) => file.endsWith('.yml',),);

  const files = [];
  // eslint-disable-next-line complexity
  yamlFiles.forEach((yamlFile,) => {
    const lang = yamlFile.replace('.yml', '',);
    const yamlPath = `${ ORIGIN_DIRECTORY }/${ yamlFile }`;

    if (! existsSync(TARGET_DIR,)) {
      mkdirSync(TARGET_DIR, {
        recursive: true,
      },);
    }

    const content = readFileSync(yamlPath, 'utf8',);
    const data = parse(content,);
    const typeName = isStrictTyping ? 'langType' : 'Partial<langType>';
    if (shouldSplit && typeof data[Object.keys(data,).pop()] !== 'string') {
      for (const key of Object.keys(data,)) {
        writeFileSync(
          `${ TARGET_DIR }/${ lang }-${ key }.ts`,
          isVerbatimModuleSyntax
            ? `/* eslint max-len:0 */\nimport {\n  lang as langType,\n} from './type-${ key }.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data[key],) };\n\nexport default lang;\n`
            : `/* eslint max-len:0 */\nimport langType from './type-${ key }.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data[key],) };\n\nexport default lang;\n`,
          'utf8',
        );
        files.push(`${ lang }-${ key }`,);
        if (lang === 'en') {
          writeFileSync(
            `${ TARGET_DIR }/type-${ key }.ts`,
            isVerbatimModuleSyntax
              ? `/* eslint max-len:0 */\ntype ln = ${ toTypescriptObject(data[key],).replace(/: '.*?',/ug, ': string,',) };\n\nexport type lang = ln;\n`
              : `/* eslint max-len:0 */\ntype lang = ${ toTypescriptObject(data[key],).replace(/: '.*?',/ug, ': string,',) };\n\nexport default lang;\n`,
            'utf8',
          );
        }
      }
    } else {
      writeFileSync(
        `${ TARGET_DIR }/${ lang }.ts`,
        isVerbatimModuleSyntax
          ? `/* eslint max-len:0 */\nimport {\n  lang as langType,\n} from './type.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data,) };\n\nexport default lang;\n`
          : `/* eslint max-len:0 */\nimport langType from './type.js';\nconst lang: ${ typeName } = ${ toTypescriptObject(data,) };\n\nexport default lang;\n`,
        'utf8',
      );
      files.push(`${ lang }`,);
      if (lang === 'en') {
        writeFileSync(
          `${ TARGET_DIR }/type.ts`,
          isVerbatimModuleSyntax
            ? `/* eslint max-len:0 */\ntype ln = ${ toTypescriptObject(data,).replace(/: '.*?',/ug, ': string,',) };\n\nexport type lang = ln;\n`
            : `/* eslint max-len:0 */\ntype lang = ${ toTypescriptObject(data,).replace(/: '.*?',/ug, ': string,',) };\n\nexport default lang;\n`,
          'utf8',
        );
      }
    }
    if (lang === 'en') {
      const keys = loadKeys(data,);
      writeFileSync(
        TARGET_DIR + '/language-key.ts',
        isVerbatimModuleSyntax
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
    TARGET_DIR + '/languages.ts',
    `/* eslint max-len:0 */\nconst languages = ${ languages };\nexport default languages;\n`,
    'utf8',
  );
  writeFileSync(
    TARGET_DIR + '/files.ts',
    `const files = ${ toTypescriptObject(files,) };\nexport default files;\n`,
    'utf8',
  );
  if (! isWithoutTranslationFile) {
    let fileImporter = '';
    let fileExporter = 'const translations = {';
    for (const f of files) {
      const v = f.replace(/-/gu, '_',);
      fileImporter += `import ${ v } from './${ f }.js';\n`;
      fileExporter += `\n  '${ f }': ${ v },`;
    }
    fileExporter += '\n};';
    writeFileSync(
      TARGET_DIR + '/translations.ts',
      `${ fileImporter }${ fileExporter }\nexport default translations;\n`,
      'utf8',
    );
  }
};
