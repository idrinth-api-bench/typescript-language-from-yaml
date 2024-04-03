#!node
import cli from '../src/cli.js';

process.exit(await cli(process.argv, process.cwd(),),);
