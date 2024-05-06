import {
  rmSync,
  readdirSync,
} from 'fs';
import {
  fileURLToPath,
  URL,
} from 'url';
const __dirname = fileURLToPath(new URL('.', import.meta.url,),);
const clearFolder = (folder,) => {
  for (const file of readdirSync(folder, {
    recursive: true,
  },)) {
    if (file.endsWith('.js',)) {
      rmSync(`${ folder }/${ file }`,);
    }
  }
};
clearFolder(__dirname + '../src',);
