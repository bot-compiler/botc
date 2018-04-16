import {Command, flags} from '@oclif/command'
import * as path from 'path';
var sematicAnalyser = require('../Semantic Analyser/analyser');
var parser = require('../Parser/validator');
var generator = require('../Machines/CompilerUtils/machineGenerator')

import * as fs from 'fs';

export default class Build extends Command {
  static description = 'initial scaffolding from bot.atmt.json'

  static examples = [
    `$ botc build
`,
  ]

  static flags = {
    dialogflow: flags.boolean({char: 'd', description: 'use dialogflow'})
  }

  static args = []

  async run() {
    const {args, flags} = this.parse(Build)
    const df = flags.dialogflow || false
    let cwd = process.cwd();
    try {
      let atmtFile = path.join(cwd, 'bot.json');
      let atmtFileJson = JSON.parse(fs.readFileSync(atmtFile, 'utf-8'));
      let errors = parser(atmtFileJson)['errors'];
      if(errors.length > 0)
        throw new Error(JSON.stringify(errors, null, '\t'))

      let syntaxTree = sematicAnalyser(atmtFileJson);
      generator.create(syntaxTree, df);
      this.log('Done scaffolding from bot.json');
    } catch (err) {
      this.error(err);
      this.log('NOTE: If you had executed botc build before, try botc rebuild');
    }
  }
}
