import {Command, flags} from '@oclif/command'
import * as path from 'path';
var sematicAnalyser = require('../Semantic Analyser/analyser');
var parser = require('../Parser/validator');
var generator = require('../Machines/CompilerUtils/machineGenerator')
import * as fs from 'fs';

export default class Rebuild extends Command {
  static description = 'apply changes in bot.atmt.json, preserve function implementations in *Impl.js files'

  static examples = [
    `$ botc rebuild`,
  ]

  static flags = {
  }

  static args = []

  async run() {
    const {args, flags} = this.parse(Rebuild)
    let cwd = process.cwd();
    try {
      let atmtFile = path.join(cwd, 'bot.json');
      let atmtFileJson = JSON.parse(fs.readFileSync(atmtFile, 'utf-8'));
      let errors = parser(atmtFileJson)['errors'];
      if(errors.length > 0)
        throw new Error(JSON.stringify(errors, null, '\t'))

      let syntaxTree = sematicAnalyser(atmtFileJson);
      generator.update(syntaxTree);
      this.log('Done applying changes from bot.json');
    } catch (err) {
      this.error(err);
    }
  }
}
