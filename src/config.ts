import {
  existsSync,
  readFileSync,
} from 'fs';
import {
  parse,
} from 'yaml';
import {
  CONFIG_FILE,
  EMPTY,
  SECOND_ARGUMENT,
} from './constants.js';

export default class Config {
  public readonly originDirectory: string;

  public readonly targetDirectory: string;

  public readonly isVerbatimModuleSyntax: boolean;

  public readonly hasNoTranslationsFile: boolean;

  public readonly isFailOnWarning: boolean;

  public readonly isStrictTypes: boolean;

  public readonly isSplit: boolean;

  public readonly folders: string[];

  // eslint-disable-next-line complexity
  constructor(cwd: string, args: string[] = [],) {
    const file = `${ cwd }/${ CONFIG_FILE }`;
    this.hasNoTranslationsFile = false;
    this.isSplit = false;
    this.originDirectory = 'language';
    this.isFailOnWarning = false;
    this.targetDirectory = 'src/locales';
    this.isStrictTypes = false;
    this.isVerbatimModuleSyntax = false;
    if (existsSync(file,)) {
      const data = parse(readFileSync(file, 'utf8',),);
      if (typeof data.hasNoTranslationsFile === 'boolean') {
        this.hasNoTranslationsFile = data.hasNoTranslationsFile;
      }
      if (typeof data.isSplit === 'boolean') {
        this.isSplit = data.isSplit;
      }
      if (typeof data.originDirectory === 'string') {
        this.originDirectory = data.originDirectory;
      }
      if (typeof data.isFailOnWarning === 'boolean') {
        this.isFailOnWarning = data.isFailOnWarning;
      }
      if (typeof data.targetDirectory === 'string') {
        this.targetDirectory = data.targetDirectory;
      }
      if (typeof data.isStrictTypes === 'boolean') {
        this.isStrictTypes = data.isStrictTypes;
      }
      if (typeof data.hasNoTranslationsFile === 'boolean') {
        this.isVerbatimModuleSyntax = data.isVerbatimModuleSyntax;
      }
    }
    if (args.includes('--no-translation-files',)) {
      this.hasNoTranslationsFile = true;
    }
    if (args.includes('--split',)) {
      this.isSplit = true;
    }
    if (args.includes('--fail-on-warning',)) {
      this.isFailOnWarning = true;
    }
    if (args.includes('--strict-types',)) {
      this.isStrictTypes = true;
    }
    if (args.includes('--verbatim-module-syntax',)) {
      this.isVerbatimModuleSyntax = true;
    }
    this.folders = args
      .slice(SECOND_ARGUMENT,)
      .filter((arg,) => ! arg.startsWith('--',),)
      .map((rel,) => `${ cwd }/${ rel }`,);
    if (this.folders.length === EMPTY) {
      this.folders.push(cwd,);
    }
  }
}
