import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
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
import {unlinkSync} from "node:fs";

export default (logger: Logger, cwd: string, shouldSplit = false, isVerbatimModuleSyntax = false) => {
  if (existsSync(`${cwd}/${TARGET_DIR}`,)) {
    for (const file in readdirSync(`${cwd}/${TARGET_DIR}`, 'utf8',)) {
      unlinkSync(`${cwd}/${TARGET_DIR}/${file}`,);
    }
  }
  const yamlFiles = readdirSync(`${ cwd }/${ ORIGIN_DIRECTORY }`, 'utf8',)
    .filter((file,) => file.endsWith('.yml',),);

  const files = [];
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
    if (shouldSplit) {
      for (const key of Object.keys(data,)) {
        writeFileSync(
          `${ TARGET_DIR }/${ lang }-${ key }.ts`,
          `/* eslint max-len:0 */\nconst lang = ${ toTypescriptObject(data[key]) };\n\nexport default lang;\n`,
          'utf8',
        );
        files.push(`${ lang }-${ key }`,);
      }
    } else {
      writeFileSync(
        `${ TARGET_DIR }/${ lang }.ts`,
        `/* eslint max-len:0 */\nconst lang = ${ toTypescriptObject(data) };\n\nexport default lang;\n`,
        'utf8',
      );
      files.push(`${ lang }`,);
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
    `const files = ${ toTypescriptObject(files) };\nexport default files;\n`,
    'utf8',
  );
  let fileImporter = '';
  let fileExporter = 'const translations = {';
  for (const f of files) {
    fileImporter += `import ${ f.replace('-', '_',) } from './${ f }.js';\n`;
    fileExporter += `\n  '${ f }': ${ f.replace('-', '_',) },`;
  }
  fileExporter += '\n};';
  writeFileSync(
    TARGET_DIR + '/translations.ts',
    `${ fileImporter }${ fileExporter }\nexport default translations;\n`,
    'utf8',
  );
};
