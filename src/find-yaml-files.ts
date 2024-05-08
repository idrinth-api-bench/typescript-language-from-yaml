import {
  readdirSync,
} from 'fs';
import Config from './config.js';

export default (folder: string, config: Config,) => readdirSync(
  `${ folder }/${ config.originDirectory }`,
  'utf8',
)
  .filter((file,) => file.endsWith('.yml',) || file.endsWith('.yaml',),)
  .map((file,) => ({
    language: file.replace(/\.ya?ml$/u, '',),
    input: `${ folder }/${ config.originDirectory }/${ file }`,
  }),);
